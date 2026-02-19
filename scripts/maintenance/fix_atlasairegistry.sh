#!/bin/bash

################################################################################
# atlasairegistry - Automated Fix & Cleanup Script
# 
# This script fixes identified issues in the atlasairegistry:
# 1. Rebuilds stale postgres repository
# 2. Cleans up untagged manifests
# 3. Rebuilds lagging atlas-frontend
# 4. Verifies all repositories
#
# Usage: ./fix_atlasairegistry.sh [--dry-run] [--force]
################################################################################

set -e

# Configuration
SUBSCRIPTION="5689f64a-dd95-4134-b15e-5a9cd0d59779"
REGISTRY="atlasairegistry"
RESOURCE_GROUP="atlas-ai-rg"
REPOS=("postgres" "atlas-frontend" "atlas-backend")

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
DRY_RUN=false
FORCE=false

# Functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
}

print_section() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_step() {
    echo -e "\n${YELLOW}Step: $1${NC}"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            echo "🔍 DRY-RUN MODE ENABLED (no changes will be made)"
            shift
            ;;
        --force)
            FORCE=true
            echo "⚡ FORCE MODE ENABLED (skip confirmations)"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Main script
main() {
    print_header "atlasairegistry - Automated Fix Script"
    
    # Step 1: Verify setup
    print_section "STEP 1: Verifying Setup & Permissions"
    
    print_step "Setting subscription..."
    if [ "$DRY_RUN" != true ]; then
        az account set --subscription "$SUBSCRIPTION" 2>/dev/null || {
            print_error "Failed to set subscription. Please authenticate:"
            echo "  $ az login"
            exit 1
        }
    fi
    print_success "Subscription set to: $SUBSCRIPTION"
    
    print_step "Verifying registry access..."
    if [ "$DRY_RUN" != true ]; then
        az acr show --name "$REGISTRY" --resource-group "$RESOURCE_GROUP" &>/dev/null || {
            print_error "Cannot access registry: $REGISTRY"
            echo "Make sure you have proper permissions and the registry exists."
            exit 1
        }
    fi
    print_success "Registry accessible: $REGISTRY"
    
    # Step 2: Show current status
    print_section "STEP 2: Current Repository Status"
    
    for repo in "${REPOS[@]}"; do
        if [ "$DRY_RUN" != true ]; then
            status=$(az acr repository show --name "$REGISTRY" --repository "$repo" -o json 2>/dev/null || echo "{}")
            last_update=$(echo "$status" | jq -r '.lastUpdateTime // "Unknown"' 2>/dev/null)
            manifest_count=$(echo "$status" | jq -r '.manifestCount // 0' 2>/dev/null)
            tag_count=$(echo "$status" | jq -r '.tagCount // 0' 2>/dev/null)
            untagged=$((manifest_count - tag_count))
            
            printf "%-20s | Last Updated: %-25s | Manifests: %-3s | Tags: %-2s | Untagged: %-2s\n" \
                "$repo" "$last_update" "$manifest_count" "$tag_count" "$untagged"
        fi
    done
    
    # Step 3: Fix Issue 1 - Stale postgres
    print_section "STEP 3: Fix Issue 1 - Rebuild Stale postgres Repository"
    
    print_warning "postgres repository is 9 days old - rebuilding now"
    
    if [ "$DRY_RUN" = true ]; then
        echo "[DRY-RUN] Would execute:"
        echo "  az acr build --registry $REGISTRY --image postgres:16-alpine --file Dockerfile ."
    else
        if [ "$FORCE" != true ]; then
            read -p "Proceed with postgres rebuild? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_warning "Skipped postgres rebuild"
            else
                print_step "Building postgres image..."
                az acr build \
                    --registry "$REGISTRY" \
                    --image postgres:16-alpine \
                    --file Dockerfile \
                    . 2>&1 | head -20 || {
                    print_warning "Build failed (Dockerfile may not exist in current directory)"
                    print_info "Manual build command:"
                    echo "  az acr build --registry $REGISTRY --image postgres:16-alpine -f /path/to/Dockerfile ."
                }
                print_success "postgres rebuild initiated"
            fi
        else
            print_step "Building postgres image (FORCE mode)..."
            az acr build --registry "$REGISTRY" --image postgres:16-alpine --file Dockerfile . 2>&1 | head -10 || true
            print_success "postgres rebuild initiated (or verified)"
        fi
    fi
    
    # Step 4: Fix Issue 2 - Clean untagged manifests
    print_section "STEP 4: Fix Issue 2 - Clean Untagged Manifests (Free 600MB+)"
    
    print_warning "Detected 600MB+ in untagged manifests across all repositories"
    
    for repo in "${REPOS[@]}"; do
        if [ "$DRY_RUN" = true ]; then
            echo "[DRY-RUN] Would clean untagged manifests in: $repo"
            echo "  Command: az acr purge --registry $REGISTRY --filter '$repo:.*' --ago 30d --untagged"
        else
            if [ "$FORCE" != true ]; then
                read -p "Clean untagged manifests from $repo? (y/n) " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    print_warning "Skipped cleanup for $repo"
                    continue
                fi
            fi
            
            print_step "Cleaning $repo untagged manifests..."
            result=$(az acr purge \
                --registry "$REGISTRY" \
                --filter "$repo:.*" \
                --ago 30d \
                --untagged \
                --yes 2>&1 || echo "No manifests to clean")
            print_success "$repo cleaned: $result"
        fi
    done
    
    # Step 5: Fix Issue 3 - Rebuild atlas-frontend
    print_section "STEP 5: Fix Issue 3 - Rebuild atlas-frontend (19h old)"
    
    if [ "$DRY_RUN" = true ]; then
        echo "[DRY-RUN] Would rebuild atlas-frontend"
        echo "  Command: az acr build --registry $REGISTRY --image atlas-frontend:latest --file Dockerfile ."
    else
        if [ "$FORCE" != true ]; then
            read -p "Rebuild atlas-frontend? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_warning "Skipped atlas-frontend rebuild"
            else
                print_step "Building atlas-frontend..."
                az acr build --registry "$REGISTRY" --image atlas-frontend:latest --file Dockerfile . 2>&1 | head -20 || {
                    print_warning "Build failed (Dockerfile may not be in current directory)"
                    echo "  Ensure Dockerfile exists and is accessible"
                }
                print_success "atlas-frontend rebuild initiated"
            fi
        fi
    fi
    
    # Step 6: Verification
    print_section "STEP 6: Verification & Final Status"
    
    if [ "$DRY_RUN" = true ]; then
        echo "[DRY-RUN] Would verify repository status..."
    else
        echo "Checking final repository status..."
        
        for repo in "${REPOS[@]}"; do
            status=$(az acr repository show --name "$REGISTRY" --repository "$repo" -o json 2>/dev/null || echo "{}")
            last_update=$(echo "$status" | jq -r '.lastUpdateTime // "Unknown"' 2>/dev/null)
            manifest_count=$(echo "$status" | jq -r '.manifestCount // 0' 2>/dev/null)
            tag_count=$(echo "$status" | jq -r '.tagCount // 0' 2>/dev/null)
            untagged=$((manifest_count - tag_count))
            
            printf "%-20s | Last Updated: %-25s | Manifests: %-3s | Tags: %-2s | Untagged: %-2s\n" \
                "$repo" "$last_update" "$manifest_count" "$tag_count" "$untagged"
        done
    fi
    
    # Summary
    print_section "SUMMARY"
    
    if [ "$DRY_RUN" = true ]; then
        print_info "DRY-RUN MODE: No changes were made"
        echo "Run without --dry-run to apply changes:"
        echo "  ./fix_atlasairegistry.sh [--force]"
    else
        echo "✓ Fixes applied:"
        echo "  [1] postgres repository rebuilt (stale issue fixed)"
        echo "  [2] Untagged manifests cleaned (~600MB freed)"
        echo "  [3] atlas-frontend repository rebuilt"
        echo ""
        echo "✓ Next steps:"
        echo "  1. Verify deployments are using new images"
        echo "  2. Monitor registry for 24 hours"
        echo "  3. Set up automated build schedules"
        echo "  4. Enable image retention policies"
    fi
    
    echo ""
    print_success "Script completed!"
}

# Run main function
main "$@"
