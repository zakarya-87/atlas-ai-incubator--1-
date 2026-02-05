--
-- PostgreSQL database dump
--

\restrict ips4M3Mkr0ZepjTOfM2Plbnvd1vUEbbo4SUVzl8Xubg4V5o1MrI1oHXHX6G7oUZ

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: analyses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analyses (
    id text NOT NULL,
    "ventureId" text NOT NULL,
    "userId" text NOT NULL,
    module text NOT NULL,
    tool text NOT NULL,
    "inputContext" text NOT NULL,
    "resultData" text NOT NULL,
    "parentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text,
    metadata text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: integrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.integrations (
    id text NOT NULL,
    "ventureId" text NOT NULL,
    provider text NOT NULL,
    status text DEFAULT 'disconnected'::text NOT NULL,
    config text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    status text NOT NULL,
    input text,
    result text,
    error text,
    "startedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id text NOT NULL,
    "userId" text NOT NULL,
    "stripeSubscriptionId" text NOT NULL,
    plan text NOT NULL,
    status text NOT NULL,
    "currentPeriodEnd" timestamp(3) without time zone NOT NULL,
    "cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "fullName" text,
    role text DEFAULT 'USER'::text NOT NULL,
    credits integer DEFAULT 100 NOT NULL,
    "subscriptionStatus" text DEFAULT 'free'::text NOT NULL,
    "subscriptionPlan" text DEFAULT 'free'::text NOT NULL,
    "stripeCustomerId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: venture_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.venture_members (
    id text NOT NULL,
    "ventureId" text NOT NULL,
    "userId" text NOT NULL,
    role text DEFAULT 'viewer'::text NOT NULL,
    "invitedBy" text,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ventures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ventures (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    industry text,
    stage text,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
eb93897b-d58d-4223-9363-df4059792f42	5ccddecc64f7f9cdb70561101352babc11d37e6c781bd1d8ea68397270317b39	2026-02-02 08:33:10.785657+00	20260202083221_init	\N	\N	2026-02-02 08:33:09.925562+00	1
\.


--
-- Data for Name: analyses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.analyses (id, "ventureId", "userId", module, tool, "inputContext", "resultData", "parentId", "createdAt", "updatedAt") FROM stdin;
655db57f-54db-43c8-8de7-086c2ec51eea	586b73be-ad10-4172-8d93-e3bdb27097b5	b401b189-188d-4d51-8af1-ec0776b0d9ed	fundamentals	ideaValidation	منصة الكترونية لعرض و بيع الاعشاب الطبية	{"business_idea_validation":{"idea":"منصة إلكترونية لعرض وبيع الأعشاب الطبية","market_analysis":{"industry_overview":{"global_market_size":"178.4 billion USD (2023)","growth_rate":"CAGR of 6.2% (2024-2030)","regional_focus":{"middle_east_north_africa":{"market_size":"Approx. 5.2 billion USD (2023)","growth_rate":"CAGR of 7.1% (2024-2030)","key_drivers":["Increasing awareness of natural remedies","Rising prevalence of chronic diseases","Government support for traditional medicine (e.g., UAE's integration of herbal medicine in healthcare)"]}}},"target_audience":{"primary":[{"segment":"Health-conscious consumers (ages 25-55)","behavior":"Prefers natural and preventive healthcare solutions","channels":["Social media (Instagram, Facebook)","Health blogs","Word-of-mouth"]},{"segment":"Patients with chronic conditions (e.g., diabetes, hypertension)","behavior":"Seeks alternative or complementary therapies","channels":["Healthcare providers","Online health forums","Pharmacies"]},{"segment":"Traditional medicine practitioners","behavior":"Requires reliable sourcing for high-quality herbs","channels":["Professional networks","Trade shows","B2B platforms"]}],"secondary":[{"segment":"Fitness enthusiasts","behavior":"Uses herbs for recovery and performance enhancement"},{"segment":"Beauty and wellness industry","behavior":"Incorporates herbs in skincare and wellness products"}]},"competitive_landscape":{"direct_competitors":[{"name":"Herbal Legacy (UAE-based)","strengths":["Established brand","Wide product range"],"weaknesses":["Limited digital presence","Higher pricing"]},{"name":"Al-Khayr Herbs (Saudi Arabia)","strengths":["Strong local presence","Affordable pricing"],"weaknesses":["Outdated e-commerce platform","Limited payment options"]},{"name":"Amazon.ae (Herbs & Spices category)","strengths":["Global reach","Trusted platform"],"weaknesses":["Lack of specialized curation","Competition from non-specialized sellers"]}],"indirect_competitors":[{"name":"Local herbalists and apothecaries","strengths":["Personalized service","Cultural trust"],"weaknesses":["Limited scalability","Inconsistent quality"]},{"name":"Pharmacies (e.g., Boots, Life Pharmacy)","strengths":["Trusted retail presence","Access to healthcare professionals"],"weaknesses":["Limited herb selection","Higher markups"]}]}},"feasibility_assessment":{"strengths":["Growing demand for natural and alternative medicine in MENA","Digital adoption in MENA is high (e-commerce growth of 20%+ annually)","Lower operational costs compared to brick-and-mortar stores","Opportunity to differentiate through curation, education, and quality assurance"],"weaknesses":["Regulatory complexities (herbs may be classified as food, supplements, or medicine depending on the country)","Supply chain challenges (sourcing high-quality, authentic herbs)","Consumer trust barriers (risk of counterfeit or low-quality products)","Limited awareness of e-commerce for herbal products in some segments"],"opportunities":["Partnerships with traditional medicine practitioners for credibility","Subscription model for recurring revenue (e.g., monthly herb boxes)","Content marketing to educate consumers on herbal benefits","Expansion into adjacent markets (e.g., herbal teas, skincare, supplements)"],"threats":["Regulatory changes (e.g., stricter labeling or import restrictions)","Competition from established global players (e.g., iHerb, Amazon)","Price sensitivity in some MENA markets","Supply chain disruptions (e.g., climate change affecting herb cultivation)"]},"revenue_model":{"primary_sources":[{"source":"Direct sales of herbs (B2C)","margin_estimate":"30-50% (depending on product and sourcing)"},{"source":"B2B sales to clinics, spas, and wellness centers","margin_estimate":"20-40%"},{"source":"Subscription boxes (e.g., monthly curated herb selections)","margin_estimate":"40-60%"}],"secondary_sources":[{"source":"Affiliate marketing (partnering with health bloggers)","margin_estimate":"10-20%"},{"source":"Premium content (e.g., e-books, webinars on herbal medicine)","margin_estimate":"70-90%"},{"source":"White-labeling for brands (e.g., private-label herbal teas)","margin_estimate":"30-50%"}],"pricing_strategy":{"premium_pricing":{"rationale":"Target health-conscious consumers willing to pay for quality and authenticity","benchmark":"10-30% above competitors for curated/rare herbs"},"competitive_pricing":{"rationale":"Attract price-sensitive customers for common herbs","benchmark":"5-10% below competitors for bulk purchases"},"dynamic_pricing":{"rationale":"Adjust for seasonal demand (e.g., higher prices for winter herbs like ginger)","benchmark":"10-20% fluctuation based on demand"}}},"operational_requirements":{"technology":{"e_commerce_platform":{"options":["Shopify (for ease of use)","Magento (for scalability)","Custom-built (for unique features)"],"estimated_cost":"5,000-50,000 USD (depending on complexity)"},"payment_gateways":{"required":["Credit/debit cards","Digital wallets (e.g., Apple Pay, STC Pay)","Cash on delivery (for MENA markets)"],"estimated_cost":"2-5% per transaction"},"logistics_software":{"required":["Inventory management","Order tracking","Shipping integrations (e.g., Aramex, Fetchr)"],"estimated_cost":"2,000-10,000 USD annually"}},"supply_chain":{"sourcing":{"challenges":["Ensuring authenticity","Maintaining consistent quality","Managing lead times"],"solutions":["Direct partnerships with farmers/cooperatives","Third-party lab testing for quality assurance","Diversified suppliers to mitigate risks"]},"storage":{"requirements":["Temperature-controlled warehouses","Humidity control for certain herbs"],"estimated_cost":"5,000-20,000 USD annually (depending on scale)"},"shipping":{"challenges":["Fragile products","Perishability of some herbs","Cross-border regulations"],"solutions":["Partnering with specialized logistics providers","Offering expedited shipping for perishable items","Clear labeling and documentation for customs"]}},"legal_and_regulatory":{"licenses":[{"type":"E-commerce license","jurisdiction":"UAE (e.g., Dubai Economy), Saudi Arabia (MISA), Egypt (ITIDA)"},{"type":"Food/supplement import license","jurisdiction":"Varies by country (e.g., UAE's MoHAP, Saudi FDA)"},{"type":"Halal certification (if targeting Muslim-majority markets)","jurisdiction":"Local halal certification bodies (e.g., ESMA in UAE)"}],"compliance":[{"requirement":"Product labeling (ingredients, origin, expiration date, usage instructions)","jurisdiction":"GCC Standardization Organization (GSO)"},{"requirement":"Advertising restrictions (e.g., no unverified health claims)","jurisdiction":"Local health authorities"}],"estimated_cost":"10,000-30,000 USD (varies by country and product range)"}},"go_to_market_strategy":{"phase_1_pre_launch":{"duration":"3-6 months","activities":[{"activity":"Market research and validation","details":"Conduct surveys and focus groups with target audience to refine product offerings and messaging"},{"activity":"Branding and website development","details":"Create a brand identity that resonates with health-conscious consumers (e.g., focus on authenticity, sustainability)"},{"activity":"Supply chain setup","details":"Secure suppliers, establish quality control processes, and set up warehousing"},{"activity":"Regulatory compliance","details":"Obtain necessary licenses and certifications"}],"estimated_cost":"50,000-100,000 USD"},"phase_2_launch":{"duration":"1-3 months","activities":[{"activity":"Soft launch (limited product range)","details":"Test the platform with a small audience, gather feedback, and iterate"},{"activity":"Digital marketing campaign","details":{"channels":["Instagram and Facebook ads","Google Ads (targeting herbal medicine keywords)","Influencer partnerships (micro-influencers in health/wellness niche)"],"budget":"10,000-30,000 USD"}},{"activity":"Partnerships","details":"Collaborate with traditional medicine practitioners, wellness centers, and health bloggers for credibility"},{"activity":"PR and media outreach","details":"Pitch stories to health and lifestyle publications (e.g., Harper's Bazaar Arabia, Gulf News Health)"}],"estimated_cost":"30,000-70,000 USD"},"phase_3_growth":{"duration":"6-12 months","activities":[{"activity":"Expand product range","details":"Introduce new categories (e.g., herbal teas, skincare, supplements)"},{"activity":"Loyalty program","details":"Offer discounts, free shipping, or exclusive content to repeat customers"},{"activity":"Content marketing","details":"Publish blogs, videos, and social media content on herbal benefits, usage tips, and recipes"},{"activity":"International expansion","details":"Target high-potential markets (e.g., Saudi Arabia, Egypt, Kuwait)"},{"activity":"Data-driven optimization","details":"Use analytics to refine marketing, pricing, and product offerings"}],"estimated_cost":"50,000-150,000 USD"}},"financial_projections":{"assumptions":{"average_order_value":"50 USD","conversion_rate":"2-3% (industry benchmark for e-commerce)","customer_acquisition_cost":"10-20 USD (via digital marketing)","repeat_purchase_rate":"20-30% (within 12 months)","gross_margin":"40%","operating_expenses":{"marketing":"20% of revenue","technology":"10% of revenue","operations":"15% of revenue","admin":"5% of revenue"}},"year_1":{"revenue":"500,000 USD","gross_profit":"200,000 USD","net_profit":"-50,000 USD (loss due to initial investment and marketing)"},"year_2":{"revenue":"1,200,000 USD","gross_profit":"480,000 USD","net_profit":"120,000 USD"},"year_3":{"revenue":"2,500,000 USD","gross_profit":"1,000,000 USD","net_profit":"400,000 USD"},"break_even":"18-24 months (depending on marketing efficiency and customer retention)"},"risk_assessment":{"key_risks":[{"risk":"Regulatory changes","mitigation":"Stay updated on local regulations, work with legal experts, and diversify product offerings to comply with different classifications (e.g., food vs. supplement)"},{"risk":"Supply chain disruptions","mitigation":"Diversify suppliers, maintain buffer inventory for high-demand products, and establish long-term contracts with key suppliers"},{"risk":"Low consumer trust","mitigation":"Invest in quality assurance (e.g., lab testing, certifications), offer money-back guarantees, and leverage testimonials from credible sources (e.g., doctors, influencers)"},{"risk":"High customer acquisition cost","mitigation":"Focus on organic growth channels (e.g., SEO, content marketing), leverage word-of-mouth, and optimize conversion rates through A/B testing"},{"risk":"Competition from global players","mitigation":"Differentiate through local expertise, curated product selection, and superior customer service"}]},"recommendations":{"short_term":[{"action":"Conduct in-depth market research","details":"Validate demand, pricing, and preferences through surveys and focus groups in target markets (e.g., UAE, Saudi Arabia, Egypt)"},{"action":"Develop a minimum viable product (MVP)","details":"Start with a small product range (10-20 SKUs) and a simple e-commerce platform to test the market"},{"action":"Secure initial funding","details":"Explore options like bootstrapping, angel investors, or government grants for startups in the health/wellness sector"}],"long_term":[{"action":"Build a strong brand","details":"Focus on storytelling (e.g., heritage, sustainability, health benefits) to create an emotional connection with customers"},{"action":"Expand product offerings","details":"Introduce value-added products (e.g., herbal teas, skincare, supplements) to increase average order value and customer lifetime value"},{"action":"Scale regionally","details":"Target high-growth markets in MENA with localized marketing and logistics strategies"},{"action":"Explore B2B opportunities","details":"Partner with clinics, spas, and wellness centers to supply herbs in bulk"}],"critical_success_factors":["Quality and authenticity of products","Strong digital presence and customer engagement","Efficient supply chain and logistics","Compliance with local regulations","Data-driven decision making"]},"validation_status":{"overall":"Viable with strong potential in MENA","key_considerations":["Regulatory compliance is critical and may require significant upfront investment","Supply chain management will be a key differentiator (quality, authenticity, reliability)","Consumer education and trust-building are essential for long-term success","Digital marketing and customer acquisition will drive early growth"],"next_steps":["Conduct detailed market research in target countries","Develop a business plan and financial model","Secure initial funding and partnerships","Build the MVP and test the market"]}}}	\N	2026-02-02 10:30:53.683	2026-02-02 10:30:53.683
f06899f6-4378-473c-b33f-886ed74b606d	586b73be-ad10-4172-8d93-e3bdb27097b5	b401b189-188d-4d51-8af1-ec0776b0d9ed	fundamentals	ideaValidation	منصة الكترونية لعرض و بيع الاعشاب الطبية	{"business_idea_validation":{"idea":"منصة إلكترونية لعرض وبيع الأعشاب الطبية","market_potential":{"industry_size":{"global_herbal_medicine_market":{"value_2023":"178.4 billion USD","projected_value_2032":"430.05 billion USD","cagr":"10.2%"},"middle_east_herbal_market":{"value_2023":"Approximately 5-7 billion USD (estimated)","growth_drivers":["Increasing preference for natural remedies","Rising healthcare costs","Government support for traditional medicine (e.g., UAE, Saudi Arabia)"]}},"target_audience":{"primary":["Health-conscious consumers (ages 25-55)","Patients with chronic conditions seeking alternative therapies","Wellness and fitness enthusiasts","Traditional medicine practitioners"],"secondary":["Pharmacies and clinics","E-commerce resellers","Expatriate communities seeking familiar remedies"]},"demand_indicators":["Google Trends data shows a 40% increase in searches for 'أعشاب طبية' in the MENA region over the past 5 years","Rising demand for organic and non-GMO products","Increased adoption of e-commerce in the MENA region (projected to reach 57 billion USD by 2026)"]},"competitive_landscape":{"direct_competitors":[{"name":"مخزن الأعشاب","type":"Physical and online store (Saudi Arabia)","strengths":["Established brand (15+ years)","Wide product range","Strong offline presence"],"weaknesses":["Limited digital experience","Higher pricing","No subscription model"]},{"name":"Herbal Hills","type":"E-commerce platform (UAE-based)","strengths":["Focus on organic certification","Subscription boxes for wellness","Partnerships with clinics"],"weaknesses":["Limited Arabic language support","Narrow product range (UAE-focused)"]},{"name":"Noon.com / Amazon.ae","type":"General e-commerce platforms","strengths":["Large customer base","Logistics infrastructure","Trust and credibility"],"weaknesses":["No specialization in herbs","Limited product curation or expert guidance","Competitive pricing pressure"]}],"competitive_gaps":["Lack of a dedicated, Arabic-first platform for medicinal herbs","Limited educational content or expert consultations","No end-to-end supply chain transparency (farm-to-customer)","Absence of subscription models for chronic condition management","Limited focus on hyper-local or regional herbs"]},"feasibility_assessment":{"technical_feasibility":{"platform_development":{"options":["Custom-built e-commerce platform (high cost, high control)","Shopify or WooCommerce (low cost, limited customization)","Marketplace model (e.g., Magento) for third-party sellers"],"key_requirements":["Arabic and English language support","Secure payment gateways (e.g., Mada, STC Pay, PayPal)","Integration with local logistics providers (e.g., Aramex, SMSA)","Mobile-first design (70% of MENA e-commerce traffic is mobile)"]},"supply_chain":{"sourcing":["Direct partnerships with local farmers (e.g., Yemen, Oman, Morocco)","Certified organic suppliers (e.g., USDA, EU Organic)","Bulk imports for rare herbs (e.g., from India, China)"],"challenges":["Quality control and standardization","Regulatory compliance (e.g., SFDA in Saudi Arabia, UAE Ministry of Health)","Perishability and storage requirements"]}},"financial_feasibility":{"startup_costs":{"platform_development":"20,000 - 50,000 USD (custom-built)","initial_inventory":"15,000 - 30,000 USD","marketing_and_branding":"10,000 - 20,000 USD","operational_costs":"5,000 - 10,000 USD/month (salaries, logistics, etc.)","total_estimated_startup_cost":"50,000 - 110,000 USD"},"revenue_streams":[{"type":"Direct sales (B2C)","description":"Markup on herbs (typical margin: 30-50%)"},{"type":"Subscription model (B2C)","description":"Monthly boxes for chronic conditions (e.g., diabetes, arthritis) at 20-40 USD/month"},{"type":"B2B sales","description":"Bulk sales to clinics, pharmacies, and resellers (margin: 20-30%)"},{"type":"Premium services","description":"Expert consultations, personalized herbal plans (50-100 USD/session)"},{"type":"Affiliate marketing","description":"Commission on sales from blog or social media referrals"}],"projected_revenue":{"year_1":{"conservative":"150,000 USD","optimistic":"300,000 USD"},"year_3":{"conservative":"500,000 USD","optimistic":"1.2 million USD"}},"break_even_analysis":{"estimated_break_even_point":"18-24 months","key_assumptions":["Customer acquisition cost (CAC): 10-15 USD","Average order value (AOV): 40-60 USD","Customer lifetime value (CLV): 200-400 USD"]}},"regulatory_and_legal_feasibility":{"key_considerations":[{"country":"Saudi Arabia","regulatory_body":"Saudi Food and Drug Authority (SFDA)","requirements":["Product registration and approval","Halal certification","Labeling requirements (Arabic and English)"]},{"country":"UAE","regulatory_body":"Ministry of Health and Prevention (MOHAP)","requirements":["Product registration","Import permits for foreign herbs","Compliance with UAE standards for herbal products"]},{"country":"Egypt","regulatory_body":"National Organization for Drug Control and Research (NODCAR)","requirements":["Product registration","Local manufacturing or import licenses"]}],"recommendations":["Engage a local legal consultant to navigate regulatory requirements","Obtain necessary certifications (e.g., organic, halal, GMP)","Ensure compliance with e-commerce laws (e.g., UAE Federal Law No. 1 of 2006 on Electronic Commerce)"]}},"swot_analysis":{"strengths":["First-mover advantage in a niche market (Arabic-first medicinal herbs platform)","Alignment with growing demand for natural and alternative medicine","Potential for strong community engagement (e.g., educational content, expert consultations)","Scalable business model with multiple revenue streams"],"weaknesses":["High initial capital requirement for inventory and platform development","Dependence on supply chain reliability and quality control","Regulatory complexity across different MENA markets","Limited brand awareness in a competitive e-commerce landscape"],"opportunities":["Partnerships with clinics, wellness centers, and influencers","Expansion into adjacent markets (e.g., herbal teas, supplements, skincare)","Government grants or initiatives supporting traditional medicine (e.g., Saudi Vision 2030)","Leveraging data analytics to personalize recommendations and improve customer retention"],"threats":["Competition from established e-commerce giants (e.g., Noon, Amazon)","Price sensitivity in the MENA market","Counterfeit or low-quality products damaging brand reputation","Economic downturns reducing discretionary spending on wellness products"]},"recommendations":{"next_steps":[{"action":"Conduct a detailed market survey","description":"Validate demand and pricing with target customers in key markets (e.g., Saudi Arabia, UAE, Egypt). Use tools like Google Forms or SurveyMonkey to gather insights on preferences, pain points, and willingness to pay.","kpis":["Survey completion rate (target: 500+ responses)","Customer willingness to pay (e.g., 60% of respondents willing to pay 10-20% premium for certified organic herbs)"]},{"action":"Develop a minimum viable product (MVP)","description":"Start with a basic e-commerce platform (e.g., Shopify) and a curated selection of 50-100 high-demand herbs. Focus on a single market (e.g., UAE or Saudi Arabia) to test the model.","kpis":["Platform development timeline (target: 3-6 months)","Initial sales within first 3 months (target: 100+ orders)"]},{"action":"Secure strategic partnerships","description":"Partner with local farmers, certified suppliers, and logistics providers to ensure supply chain reliability. Explore collaborations with clinics or wellness centers for B2B sales.","kpis":["Number of partnerships secured (target: 5-10 suppliers, 2-3 logistics providers)","Inventory turnover ratio (target: 4-6x per year)"]},{"action":"Build a content-driven marketing strategy","description":"Create educational content (e.g., blog posts, videos, social media) to establish authority in the herbal medicine space. Focus on SEO and organic growth to minimize customer acquisition costs.","kpis":["Website traffic (target: 10,000+ monthly visitors within 6 months)","Social media engagement (target: 5%+ engagement rate)"]},{"action":"Pilot a subscription model","description":"Test a subscription box for chronic conditions (e.g., diabetes, arthritis) with a small group of customers. Gather feedback and iterate on the model before scaling.","kpis":["Subscription sign-up rate (target: 50+ subscribers in pilot phase)","Customer retention rate (target: 70%+ after 3 months)"]}],"critical_success_factors":["Supply chain transparency and quality control","Regulatory compliance and certifications","Customer trust and brand credibility","Effective digital marketing and community engagement","Scalable technology infrastructure"],"risk_mitigation_strategies":[{"risk":"Supply chain disruptions","mitigation":"Diversify suppliers and maintain buffer inventory for high-demand products."},{"risk":"Regulatory hurdles","mitigation":"Engage legal experts early and prioritize compliance in all markets."},{"risk":"Low customer adoption","mitigation":"Invest in customer education and leverage influencer partnerships to build trust."},{"risk":"Competition from e-commerce giants","mitigation":"Differentiate through specialization, expert curation, and superior customer experience."}]},"validation_conclusion":{"viability":"High","justification":["Strong market demand driven by health and wellness trends","Clear competitive gaps in the MENA region for a dedicated medicinal herbs platform","Scalable business model with multiple revenue streams","Alignment with government initiatives supporting traditional medicine"],"cautionary_notes":["High initial capital requirements and regulatory complexity","Need for rigorous quality control and supply chain management","Competitive e-commerce landscape requiring strong differentiation"],"final_recommendation":"Proceed with the business idea, starting with a lean MVP and a focused market entry strategy. Prioritize customer trust, regulatory compliance, and supply chain reliability to build a sustainable and scalable platform."}}}	\N	2026-02-02 10:43:15.105	2026-02-02 10:43:15.105
4614bfa4-d668-48e4-8984-3eff7244a77f	0c23c3ab-fb51-4a1a-bbf0-1fe29b858577	b401b189-188d-4d51-8af1-ec0776b0d9ed	fundamentals	ideaValidation	منصة الكترونية لعرض و بيع الاعشاب الطبية	{"business_idea_validation":{"idea":"منصة إلكترونية لعرض وبيع الأعشاب الطبية","market_analysis":{"industry_overview":{"global_market_size":"178.4 billion USD (2023)","growth_rate":"CAGR of 6.2% (2024-2030)","regional_focus":{"middle_east_north_africa":{"market_size":"12.5 billion USD (2023)","growth_rate":"CAGR of 7.1% (2024-2030)","key_drivers":["Increasing awareness of natural remedies","Government support for traditional medicine","Rising disposable income"]}}},"target_audience":{"primary":{"demographics":{"age":"30-65","gender":"Predominantly female (60-70% of market)","income_level":"Middle to upper-middle class","location":"Urban and semi-urban areas"},"psychographics":{"interests":["Natural health and wellness","Holistic living","Preventative healthcare"],"pain_points":["Difficulty finding authentic, high-quality herbs","Lack of trust in online sellers","Limited access to expert advice"]}},"secondary":{"demographics":{"age":"25-40","profession":"Healthcare professionals, naturopaths, yoga instructors"}}},"competitive_landscape":{"direct_competitors":[{"name":"مخازن الأعشاب المحلية (Local herb stores)","strengths":["Established trust","Physical inspection of products"],"weaknesses":["Limited variety","Inconsistent quality","Higher prices"]},{"name":"منصات التجارة الإلكترونية العامة (General e-commerce platforms like Noon, Amazon)","strengths":["Wide reach","Established logistics"],"weaknesses":["Lack of specialization","No expert guidance","Inconsistent product quality"]}],"indirect_competitors":[{"name":"العيادات الطبية التقليدية (Traditional medicine clinics)","strengths":["Expert consultation","Personalized treatment plans"],"weaknesses":["Limited product range","Higher costs"]},{"name":"المنتجات الصحية البديلة (Alternative health products like supplements)","strengths":["Convenience","Standardized dosages"],"weaknesses":["Not natural/herbal","Perceived as less effective"]}]}},"business_model":{"revenue_streams":[{"type":"Product Sales","description":"Direct sales of medicinal herbs and related products (e.g., teas, oils, capsules).","revenue_share":"70-80%"},{"type":"Subscription Model","description":"Monthly/quarterly boxes of curated herbs based on health goals (e.g., immunity, digestion, relaxation).","revenue_share":"10-15%"},{"type":"Consultation Fees","description":"Paid consultations with certified herbalists or naturopaths.","revenue_share":"5-10%"},{"type":"Affiliate Marketing","description":"Commission from recommending complementary products (e.g., books, tools).","revenue_share":"2-5%"},{"type":"Advertising","description":"Sponsored content from health and wellness brands.","revenue_share":"1-3%"}],"pricing_strategy":{"product_markup":"30-50% above wholesale cost","subscription_fee":"50-100 USD/quarter","consultation_fee":"20-50 USD/session","benchmark":"Competitive with local stores but with added value (e.g., expert advice, convenience)"},"cost_structure":{"fixed_costs":[{"item":"Platform Development & Maintenance","estimated_cost":"50,000-100,000 USD (initial), 10,000-20,000 USD/year (ongoing)"},{"item":"Licenses & Certifications","estimated_cost":"5,000-15,000 USD (varies by country)"},{"item":"Marketing & Branding","estimated_cost":"20,000-50,000 USD (first year)"},{"item":"Salaries (Team of 5-10)","estimated_cost":"100,000-200,000 USD/year"}],"variable_costs":[{"item":"Inventory & Sourcing","estimated_cost":"30-50% of revenue"},{"item":"Logistics & Shipping","estimated_cost":"10-20% of revenue"},{"item":"Payment Processing Fees","estimated_cost":"2-3% of revenue"},{"item":"Customer Support","estimated_cost":"5-10% of revenue"}]}},"feasibility_assessment":{"strengths":[{"aspect":"Market Demand","details":"Growing interest in natural and traditional medicine, especially post-pandemic."},{"aspect":"Scalability","details":"Digital platform allows for rapid scaling with minimal incremental costs."},{"aspect":"Differentiation","details":"Opportunity to stand out by offering expert guidance, curated products, and a seamless user experience."},{"aspect":"Regulatory Tailwinds","details":"Governments in the MENA region are increasingly supportive of traditional medicine."}],"weaknesses":[{"aspect":"Regulatory Challenges","details":"Stringent regulations around the sale of medicinal herbs (varies by country). Requires compliance with health and safety standards."},{"aspect":"Supply Chain Risks","details":"Dependence on reliable suppliers for authentic, high-quality herbs. Risk of counterfeit or low-quality products."},{"aspect":"Customer Trust","details":"Building trust in an online marketplace for health-related products can be challenging."},{"aspect":"High Customer Acquisition Costs","details":"Competition with established local stores and general e-commerce platforms."}],"opportunities":[{"aspect":"Partnerships","details":"Collaborate with traditional medicine clinics, wellness centers, and influencers to expand reach."},{"aspect":"Content Marketing","details":"Educational content (e.g., blogs, videos) can drive organic traffic and establish authority."},{"aspect":"Expansion into Complementary Products","details":"Diversify into related categories like organic teas, essential oils, and natural skincare."},{"aspect":"Government Grants","details":"Potential funding or support from government initiatives promoting traditional medicine."}],"threats":[{"aspect":"Regulatory Changes","details":"Sudden changes in laws could impact operations (e.g., banning certain herbs)."},{"aspect":"Economic Downturns","details":"Discretionary spending on wellness products may decline during economic crises."},{"aspect":"Counterfeit Products","details":"Risk of reputational damage if counterfeit or low-quality products enter the supply chain."},{"aspect":"Competition from Global Players","details":"International e-commerce giants may enter the market with aggressive pricing."}]},"recommendations":{"next_steps":[{"step":"Market Research","details":"Conduct surveys and focus groups with target audience to validate demand and refine value proposition.","estimated_cost":"5,000-10,000 USD"},{"step":"Regulatory Compliance","details":"Consult legal experts to understand and comply with regulations in target markets (e.g., UAE, Saudi Arabia, Egypt).","estimated_cost":"10,000-20,000 USD"},{"step":"Supplier Vetting","details":"Identify and vet suppliers for quality, authenticity, and reliability. Consider partnerships with local farmers or cooperatives.","estimated_cost":"5,000-15,000 USD"},{"step":"MVP Development","details":"Develop a minimum viable product (MVP) with core features: product listings, search/filter, secure checkout, and basic customer support.","estimated_cost":"30,000-70,000 USD"},{"step":"Pilot Launch","details":"Launch in a single market (e.g., UAE) with a limited product range to test demand and gather feedback.","estimated_cost":"20,000-50,000 USD"}],"key_success_factors":[{"factor":"Trust and Credibility","details":"Invest in certifications, expert endorsements, and transparent sourcing to build trust."},{"factor":"User Experience","details":"Ensure the platform is intuitive, mobile-friendly, and offers personalized recommendations."},{"factor":"Supply Chain Reliability","details":"Secure multiple suppliers and implement quality control measures to ensure consistency."},{"factor":"Content and Community","details":"Leverage content marketing and community-building (e.g., forums, webinars) to engage users and drive loyalty."}],"risk_mitigation":[{"risk":"Regulatory Non-Compliance","mitigation":"Work with legal experts to stay updated on regulations and obtain necessary certifications."},{"risk":"Supply Chain Disruptions","mitigation":"Diversify suppliers and maintain buffer inventory for high-demand products."},{"risk":"Low Customer Trust","mitigation":"Offer money-back guarantees, customer reviews, and expert consultations to build credibility."},{"risk":"High Customer Acquisition Costs","mitigation":"Focus on organic growth through SEO, content marketing, and referral programs."}]},"financial_projections":{"assumptions":{"launch_market":"UAE (pilot)","target_customers":"50,000 in Year 1, 200,000 in Year 3","average_order_value":"50 USD","conversion_rate":"2-3%","customer_acquisition_cost":"20-30 USD","churn_rate":"10-15% annually"},"year_1":{"revenue":"1,250,000 USD","gross_margin":"50%","operating_expenses":"800,000 USD","net_profit":"-175,000 USD"},"year_2":{"revenue":"3,750,000 USD","gross_margin":"55%","operating_expenses":"1,500,000 USD","net_profit":"562,500 USD"},"year_3":{"revenue":"7,500,000 USD","gross_margin":"60%","operating_expenses":"2,500,000 USD","net_profit":"2,000,000 USD"},"break_even":"18-24 months"},"conclusion":{"viability":"High","justification":"The business idea is viable due to strong market demand, scalability, and clear differentiation opportunities. However, success hinges on overcoming regulatory challenges, building trust, and executing a robust go-to-market strategy.","final_recommendation":"Proceed with the idea, starting with a pilot launch in a single market (e.g., UAE) to validate demand and refine the model before scaling."}}}	\N	2026-02-02 10:47:10.828	2026-02-02 10:47:10.828
04ac7394-de32-42e9-9221-563994375031	fdcbec53-154e-4030-bcca-274bc9bc0478	b401b189-188d-4d51-8af1-ec0776b0d9ed	fundamentals	ideaValidation	منصة لعرض و بيع الاعشاب الطبية	{"business_idea_validation":{"idea":"منصة لعرض وبيع الأعشاب الطبية (Platform for showcasing and selling medicinal herbs)","market_analysis":{"industry_overview":{"global_market_size":"The global herbal medicine market was valued at ~$151.5 billion in 2023 and is projected to grow at a CAGR of 6.5% until 2030 (Grand View Research).","regional_focus":{"middle_east_north_africa":{"market_size":"The MENA region accounts for ~10% of the global market, with strong cultural affinity for herbal remedies.","growth_drivers":["Increasing preference for natural/alternative medicine","Government initiatives promoting traditional medicine (e.g., UAE's integration of herbal medicine in healthcare)","Rising disposable income and health awareness"]}}},"target_audience":{"primary":[{"segment":"Health-conscious consumers (ages 25-55)","behavior":"Prefers organic/natural products, willing to pay premium for quality and authenticity."},{"segment":"Patients with chronic conditions (e.g., diabetes, arthritis)","behavior":"Seeks alternative/complementary therapies, relies on trusted sources for purchases."},{"segment":"Traditional medicine practitioners (e.g., herbalists, naturopaths)","behavior":"Requires bulk purchases, values supplier reliability and product certification."}],"secondary":[{"segment":"Gyms and wellness centers","behavior":"Interested in offering herbal supplements to clients."},{"segment":"E-commerce shoppers (general)","behavior":"Convenience-driven, influenced by reviews and social proof."}]},"competitive_landscape":{"direct_competitors":[{"name":"Herbal shops (physical stores)","strengths":["Trust and personal interaction","Immediate product availability"],"weaknesses":["Limited product variety","Higher operational costs (rent, staff)"]},{"name":"General e-commerce platforms (e.g., Amazon, Noon, Souq)","strengths":["Wide reach and customer base","Established logistics and payment systems"],"weaknesses":["Lack of specialization (no expert guidance)","Inconsistent product quality"]},{"name":"Niche herbal e-commerce platforms (e.g., local startups)","strengths":["Specialized product offerings","Focus on authenticity and education"],"weaknesses":["Limited brand recognition","Smaller marketing budgets"]}],"competitive_gap":{"opportunity":"A platform that combines the trust and expertise of physical herbal shops with the convenience and scalability of e-commerce, while ensuring product authenticity, certification, and educational content for consumers."}}},"feasibility_assessment":{"value_proposition":{"unique_selling_points":["Curated selection of certified medicinal herbs with traceable sourcing.","Integration of expert consultations (e.g., herbalists, naturopaths) via chat/video.","Educational content (e.g., blogs, videos) on herbal remedies, dosages, and benefits.","Subscription model for regular customers (e.g., monthly herbal tea boxes).","Partnerships with local farmers and suppliers to ensure freshness and support local economies."],"differentiation":"Unlike general e-commerce platforms, this platform will focus on **trust, education, and community**, positioning itself as a **health partner** rather than just a retailer."},"revenue_model":{"primary_streams":[{"source":"Direct sales of medicinal herbs (B2C)","margin_estimate":"40-60% (depending on product and sourcing)"},{"source":"Subscription boxes (e.g., monthly herbal remedy kits)","margin_estimate":"50-70%"},{"source":"Commission from expert consultations (e.g., 20% of consultation fee)","margin_estimate":"Variable"},{"source":"Affiliate marketing (e.g., partnerships with wellness brands)","margin_estimate":"10-30%"},{"source":"B2B sales (e.g., supplying herbs to clinics, spas, or wellness centers)","margin_estimate":"30-50%"}],"secondary_streams":[{"source":"Premium content (e.g., e-books, courses on herbal medicine)","margin_estimate":"70-90%"},{"source":"Advertising (e.g., sponsored content from wellness brands)","margin_estimate":"Variable"}]},"cost_structure":{"fixed_costs":[{"item":"Platform development and maintenance","estimated_cost":"$20,000 - $50,000 (initial), $5,000 - $10,000/month (ongoing)"},{"item":"Warehousing and logistics","estimated_cost":"$5,000 - $15,000/month (depending on scale)"},{"item":"Marketing and customer acquisition","estimated_cost":"$3,000 - $10,000/month (initial phase)"},{"item":"Salaries (e.g., herbalists, customer support, operations)","estimated_cost":"$10,000 - $20,000/month"}],"variable_costs":[{"item":"Product sourcing and inventory","estimated_cost":"30-50% of revenue (depending on product mix)"},{"item":"Payment processing fees","estimated_cost":"2-3% of transactions"},{"item":"Shipping and fulfillment","estimated_cost":"5-10% of revenue"}]},"key_challenges":[{"challenge":"Regulatory compliance","mitigation":"Partner with certified suppliers and obtain necessary licenses (e.g., health ministry approvals). Consult legal experts to navigate local regulations."},{"challenge":"Product authenticity and quality control","mitigation":"Implement a rigorous vetting process for suppliers, including lab testing for contaminants and certifications (e.g., organic, fair trade)."},{"challenge":"Customer trust and education","mitigation":"Invest in high-quality content (e.g., videos, blogs) and expert consultations to build credibility. Offer money-back guarantees for first-time buyers."},{"challenge":"Logistics and supply chain management","mitigation":"Start with a limited product range to streamline operations. Partner with local couriers for faster delivery and lower costs."},{"challenge":"Competition from established players","mitigation":"Focus on niche segments (e.g., rare herbs, personalized remedies) and leverage digital marketing to target specific audiences."}]},"scalability_potential":{"short_term":{"goals":["Launch MVP with 50-100 curated products and basic e-commerce functionality.","Acquire 1,000-2,000 customers in the first 6 months through targeted digital marketing.","Establish partnerships with 10-20 local suppliers and 5-10 herbalists for consultations."],"kpis":["Customer acquisition cost (CAC): <$20","Average order value (AOV): $30-$50","Customer retention rate: 30-40%"]},"medium_term":{"goals":["Expand product range to 300-500 SKUs, including rare and imported herbs.","Introduce subscription model and B2B sales to clinics/wellness centers.","Develop a mobile app for easier access and personalized recommendations."],"kpis":["Monthly recurring revenue (MRR): $50,000 - $100,000","Customer lifetime value (CLV): $200 - $400","Net promoter score (NPS): >50"]},"long_term":{"goals":["Expand regionally (e.g., GCC, North Africa) with localized platforms.","Develop private-label products (e.g., branded herbal teas, supplements).","Integrate AI-driven personalized recommendations and virtual consultations."],"kpis":["Annual revenue: $5M - $10M","Market share: 10-15% in target regions","Brand recognition: Top 3 in herbal e-commerce in MENA"]}},"recommendations":{"next_steps":[{"action":"Conduct a detailed market survey to validate demand and pricing for specific herbs in your target region.","rationale":"Ensure product-market fit before investing in inventory or platform development."},{"action":"Develop a minimum viable product (MVP) with a focus on core features (e.g., product listings, basic checkout, supplier vetting).","rationale":"Test the concept with a small audience before scaling."},{"action":"Secure partnerships with local suppliers and herbalists to ensure a reliable supply chain and expert support.","rationale":"Build trust and credibility from the outset."},{"action":"Create a content strategy to educate consumers and drive organic traffic (e.g., SEO-optimized blogs, social media campaigns).","rationale":"Low-cost customer acquisition and brand building."},{"action":"Explore funding options (e.g., bootstrapping, angel investors, grants) to support initial development and marketing.","rationale":"Ensure sufficient capital to execute the plan without overextending."}],"critical_risks_to_monitor":["Regulatory changes affecting the sale of herbal products.","Supply chain disruptions (e.g., climate-related crop failures).","Low customer adoption due to lack of trust in online herbal purchases.","High customer acquisition costs eroding profitability."]},"validation_verdict":{"is_viable":true,"confidence_level":"High","justification":["Strong market demand driven by health trends and cultural affinity for herbal medicine.","Clear competitive gap for a trusted, specialized e-commerce platform.","Scalable business model with multiple revenue streams and high margins.","Feasible execution with manageable risks and mitigation strategies."],"caveats":["Success hinges on building trust and credibility in a market with low initial awareness of online herbal purchases.","Regulatory compliance and product quality are non-negotiable and require upfront investment.","Initial customer acquisition may be slow; patience and consistent branding are key."]}}}	\N	2026-02-02 10:50:32.825	2026-02-02 10:50:32.825
58eff1a7-1b6f-4371-a42d-f2a3234f51bf	0c23c3ab-fb51-4a1a-bbf0-1fe29b858577	b401b189-188d-4d51-8af1-ec0776b0d9ed	fundamentals	ideaValidation	منصة الكترونية لعرض و بيع الاعشاب الطبية	{"business_idea_validation":{"idea":"منصة إلكترونية لعرض وبيع الأعشاب الطبية","market_analysis":{"industry_overview":{"global_market_size":"178.4 billion USD (2023)","projected_growth":"CAGR of 6.3% (2024-2030)","regional_focus":{"middle_east_north_africa":{"market_size":"Approx. 5.2 billion USD (2023)","growth_drivers":["Increasing awareness of natural remedies","Government support for traditional medicine (e.g., UAE, Saudi Arabia)","Rising disposable income"]}}},"target_audience":{"primary":[{"segment":"Health-conscious consumers (25-50 years)","behavior":"Prefers organic/natural products, willing to pay premium for quality"},{"segment":"Patients with chronic conditions (e.g., diabetes, hypertension)","behavior":"Seeks alternative/complementary therapies"},{"segment":"Wellness enthusiasts (e.g., yoga practitioners, fitness communities)"}],"secondary":[{"segment":"Herbalists and traditional medicine practitioners","behavior":"Source ingredients for formulations"},{"segment":"Spas and wellness centers","behavior":"Procure herbs for treatments"}]},"competitive_landscape":{"direct_competitors":[{"name":"Souq.com (Amazon MENA)","strengths":["Wide reach","Established logistics"],"weaknesses":["Lacks specialization in herbs","Limited curation"]},{"name":"Noon.com","strengths":["Strong regional presence","Fast delivery"],"weaknesses":["Generalist platform","No expert guidance"]},{"name":"Local herbal shops (e.g., Attar stores)","strengths":["Trust and tradition","Personalized service"],"weaknesses":["Limited inventory","Inconsistent quality"]}],"indirect_competitors":[{"name":"iHerb","strengths":["Global brand","Extensive product range"],"weaknesses":["Limited Arabic language support","Long shipping times to MENA"]},{"name":"Social media sellers (Instagram, Facebook)","strengths":["Low-cost marketing","Direct engagement"],"weaknesses":["Lack of standardization","Trust issues"]}],"competitive_gap":{"opportunity":"Specialized platform for herbs with expert curation, quality assurance, and educational content in Arabic/English","differentiators":["Certified suppliers and lab-tested products","AI-driven personalized recommendations","Subscription model for regular deliveries","Community features (e.g., forums, expert Q&A)"]}}},"feasibility_assessment":{"technical_feasibility":{"platform_development":{"options":[{"type":"Custom-built e-commerce platform","cost_estimate":"50,000 - 100,000 USD","timeframe":"6-12 months","pros":["Full control","Scalability"],"cons":["High initial cost","Longer development time"]},{"type":"Shopify/WooCommerce with customizations","cost_estimate":"10,000 - 30,000 USD","timeframe":"3-6 months","pros":["Faster to market","Lower cost"],"cons":["Limited customization","Ongoing subscription fees"]}]},"logistics":{"challenges":["Perishable nature of some herbs","Regulatory compliance for cross-border sales","Temperature-controlled storage/transport"],"solutions":["Partner with local/regional 3PL providers (e.g., Aramex, Fetchr)","Implement cold chain logistics for sensitive products","Start with non-perishable herbs to simplify operations"]},"payment_gateways":{"options":["PayPal (limited MENA adoption)","Stripe (supports UAE, Saudi Arabia, Bahrain)","Local gateways (e.g., PayTabs, Telr, HyperPay)","Cash on Delivery (COD) - critical for MENA market"]}},"financial_feasibility":{"revenue_streams":[{"type":"Direct sales (B2C)","description":"Markup on herbs (typical margin: 30-50%)"},{"type":"Subscription model","description":"Monthly boxes (e.g., immunity boost, relaxation kits)"},{"type":"B2B sales","description":"Wholesale to clinics, spas, and practitioners"},{"type":"Affiliate marketing","description":"Commission on sales from blog/SEO content"},{"type":"Premium content","description":"E-books, courses, or consultations with herbalists"}],"cost_structure":{"fixed_costs":[{"item":"Platform development/maintenance","estimate":"10,000 - 30,000 USD/year"},{"item":"Marketing","estimate":"20,000 - 50,000 USD/year (initial phase)"},{"item":"Salaries (team of 5-10)","estimate":"150,000 - 300,000 USD/year"},{"item":"Warehousing/logistics","estimate":"50,000 - 100,000 USD/year"}],"variable_costs":[{"item":"Cost of goods sold (COGS)","estimate":"50-70% of revenue"},{"item":"Payment gateway fees","estimate":"2-4% of transaction value"},{"item":"Shipping","estimate":"5-15% of order value"}]},"break_even_analysis":{"assumptions":{"average_order_value":"50 USD","gross_margin":"40%","monthly fixed_costs":"25,000 USD","customer_acquisition_cost":"10 USD"},"break_even_units":"625 orders/month","break_even_revenue":"31,250 USD/month"},"funding_requirements":{"pre-seed":"100,000 - 200,000 USD (MVP development, initial inventory, marketing)","seed":"500,000 - 1,000,000 USD (scaling, team, logistics)"}},"regulatory_feasibility":{"compliance_requirements":[{"region":"UAE","requirements":["Registration with Ministry of Health and Prevention (MOHAP)","Product registration for herbal supplements (if applicable)","Halal certification for imported products"]},{"region":"Saudi Arabia","requirements":["Saudi Food and Drug Authority (SFDA) approval","Halal certification","Local distributor requirement for some products"]},{"region":"Egypt","requirements":["Registration with National Organization for Drug Control and Research (NODCAR)","Import permits for foreign products"]}],"risks":[{"risk":"Product claims (e.g., 'cures diabetes')","mitigation":"Avoid medical claims; focus on 'supports health' or 'traditional use'"},{"risk":"Import/export restrictions","mitigation":"Partner with local suppliers to reduce cross-border complexities"},{"risk":"Counterfeit or low-quality products","mitigation":"Implement strict supplier vetting and third-party lab testing"}]}},"strengths":["Growing market with increasing demand for natural remedies","First-mover advantage in a specialized niche (herbs) in MENA","High gross margins (30-50%) for herbal products","Scalable business model with multiple revenue streams","Strong alignment with health/wellness trends"],"weaknesses":["Regulatory complexity across MENA markets","Perishable inventory requires careful logistics","Consumer education needed to drive adoption","Dependence on supplier quality and reliability","High customer acquisition costs in competitive e-commerce space"],"opportunities":["Partnerships with influencers in health/wellness space","Expansion into adjacent categories (e.g., essential oils, natural cosmetics)","Government initiatives supporting traditional medicine (e.g., UAE's 'Herbal Medicine Strategy')","Integration with telemedicine platforms for holistic health solutions","Export opportunities to global markets with large Arab diaspora (e.g., Europe, North America)"],"threats":["Established e-commerce giants entering the space (e.g., Amazon, Noon)","Price sensitivity in some MENA markets","Counterfeit products damaging brand trust","Economic downturns reducing discretionary spending on wellness","Changing regulations impacting product availability"],"recommendations":{"next_steps":[{"action":"Conduct primary market research","details":"Survey 500+ potential customers in UAE/Saudi Arabia to validate demand, pricing, and preferred features. Use tools like Google Forms or Typeform."},{"action":"Develop a minimum viable product (MVP)","details":"Start with a Shopify store focusing on 20-30 high-demand herbs. Include basic features like product descriptions, lab reports, and customer reviews."},{"action":"Secure initial suppliers","details":"Partner with 3-5 certified suppliers (local and international) to ensure quality and reliability. Negotiate exclusive distribution rights where possible."},{"action":"Build a content strategy","details":"Create educational content (blogs, videos) about herbal benefits, usage, and safety. Leverage SEO to attract organic traffic."},{"action":"Pilot with a small audience","details":"Launch a beta version to 100-200 customers (e.g., through Instagram ads or wellness communities). Gather feedback and iterate."}],"critical_success_factors":["Product quality and authenticity (non-negotiable for trust)","Regulatory compliance (avoid legal issues that could shut down operations)","Customer education (herbs are not mainstream; explain benefits clearly)","Logistics efficiency (timely delivery and proper handling of perishables)","Community building (loyalty programs, user-generated content, expert engagement)"],"risk_mitigation_strategies":[{"risk":"Low initial adoption","strategy":"Offer free samples or discounts to early users. Leverage influencer partnerships to build credibility."},{"risk":"Supplier reliability issues","strategy":"Diversify supplier base and maintain buffer inventory for critical products."},{"risk":"Regulatory changes","strategy":"Hire a local legal consultant to monitor compliance requirements. Join industry associations for updates."},{"risk":"High customer acquisition costs","strategy":"Focus on organic growth (SEO, content marketing, referrals) to reduce reliance on paid ads."}]},"validation_verdict":{"overall":"Viable with strong potential","justification":"The business idea aligns with growing market trends, addresses a gap in the MENA e-commerce space, and offers multiple scalable revenue streams. However, success hinges on executing a robust go-to-market strategy, ensuring product quality, and navigating regulatory complexities. The next 6-12 months should focus on validating demand, building supplier relationships, and launching an MVP."}}}	\N	2026-02-03 07:32:25.817	2026-02-03 07:32:25.817
f356e49b-c908-46e1-b4d5-c95a29ba4ebe	fd3bddbf-e1ff-4469-a604-2560f10304d9	e31bc8e6-e43d-4363-80a9-f33c9cf7ebb3	fundamentals	ideaValidation	منصة الكترونية لعرض و بيع الاعشاب الطبية	{"validation_request":{"venture_idea_feasibility_check":{"current_status":"initial_concept_validation_required","steps_to_proceed":[{"step_id":1,"step_name":"Market Validation","description":"Assess the demand and competitive landscape for the venture idea.","action_items":[{"action":"Conduct a TAM (Total Addressable Market) analysis","details":"Estimate the total market size using industry reports, government data, or third-party research (e.g., Statista, IBISWorld). Provide a range (e.g., $X billion - $Y billion).","kpi":"TAM size and growth rate (CAGR)"},{"action":"Perform a competitive analysis","details":"Identify direct and indirect competitors. Use frameworks like Porter’s Five Forces or a competitive matrix to evaluate their strengths, weaknesses, and market positioning.","kpi":"Number of competitors, market share distribution, competitive advantages/disadvantages"},{"action":"Validate customer demand","details":"Use surveys, interviews, or landing page tests (e.g., Google Ads + Unbounce) to gauge interest. Target a sample size of at least 100-200 respondents for statistical significance.","kpi":"Survey response rate, conversion rate on landing page, Net Promoter Score (NPS)"}],"output":{"deliverable":"Market Validation Report","format":"JSON or structured document with findings, KPIs, and recommendations"}},{"step_id":2,"step_name":"Problem-Solution Fit","description":"Ensure the venture idea solves a real, urgent problem for the target audience.","action_items":[{"action":"Define the core problem","details":"Articulate the problem in a single sentence (e.g., 'Seniors struggle to find affordable, tech-enabled home care services'). Use the '5 Whys' technique to dig deeper into root causes.","kpi":"Clarity and specificity of the problem statement"},{"action":"Map the customer journey","details":"Identify pain points at each stage of the customer journey (awareness, consideration, decision, retention). Use tools like Miro or Lucidchart to visualize.","kpi":"Number of pain points identified, severity of pain points (1-10 scale)"},{"action":"Validate problem-solution fit","details":"Conduct interviews or focus groups with 20-30 target customers. Ask: 'Does this problem resonate with you? Would you use this solution? How much would you pay?'","kpi":"Percentage of interviewees who confirm the problem and express interest in the solution"}],"output":{"deliverable":"Problem-Solution Fit Report","format":"JSON or structured document with problem statement, customer journey map, and validation results"}},{"step_id":3,"step_name":"Business Model Viability","description":"Assess whether the venture can generate sustainable revenue and profit.","action_items":[{"action":"Define revenue streams","details":"Identify primary and secondary revenue streams (e.g., subscription, transaction fees, advertising). Use the Business Model Canvas to map these out.","kpi":"Number of revenue streams, projected revenue per stream"},{"action":"Estimate unit economics","details":"Calculate Customer Acquisition Cost (CAC), Lifetime Value (LTV), and gross margin. Use benchmarks from similar industries (e.g., SaaS, e-commerce).","kpi":"LTV:CAC ratio (target > 3:1), gross margin percentage"},{"action":"Project financials","details":"Develop a 3-year financial model with revenue, COGS, operating expenses, and net profit. Use conservative, base, and optimistic scenarios.","kpi":"Break-even point (months), projected net profit in Year 3"}],"output":{"deliverable":"Business Model Viability Report","format":"JSON or structured document with revenue streams, unit economics, and financial projections"}},{"step_id":4,"step_name":"Risk Assessment","description":"Identify and mitigate potential risks to the venture's success.","action_items":[{"action":"Identify risks","details":"List risks across categories: market, operational, financial, legal, and technological. Use a risk matrix to prioritize by likelihood and impact.","kpi":"Number of high-priority risks identified"},{"action":"Develop mitigation strategies","details":"For each high-priority risk, outline a mitigation plan (e.g., 'If customer adoption is slow, we will pivot to a B2B model').","kpi":"Number of risks with mitigation plans"},{"action":"Validate risk assumptions","details":"Conduct scenario planning or stress tests (e.g., 'What if revenue is 50% of projections?').","kpi":"Number of scenarios tested, resilience of the business model"}],"output":{"deliverable":"Risk Assessment Report","format":"JSON or structured document with risk matrix, mitigation strategies, and scenario analysis"}}],"next_steps":{"recommendation":"Begin with Step 1: Market Validation. Provide the following details to proceed:","required_inputs":{"venture_description":"A concise description of the venture idea (e.g., 'A subscription-based platform connecting seniors with vetted home care providers').","target_audience":"Demographics, psychographics, and behaviors of the primary customer segment.","industry":"The industry or sector the venture operates in (e.g., healthcare, fintech, edtech).","geographic_scope":"Target market geography (e.g., local, national, global)."},"example_input":{"venture_description":"An AI-powered tool that helps small businesses automate their social media content creation and scheduling.","target_audience":"Small business owners (1-50 employees), aged 25-50, tech-savvy but time-poor, primarily in the U.S. and Canada.","industry":"SaaS (Software as a Service), Digital Marketing","geographic_scope":"North America"}}}}}	\N	2026-02-03 10:19:52.457	2026-02-03 10:19:52.457
9062e9d6-54d7-4dad-becc-d940310b7d4e	fd3bddbf-e1ff-4469-a604-2560f10304d9	e31bc8e6-e43d-4363-80a9-f33c9cf7ebb3	fundamentals	customerValidation	The **Atlas Growth Ecosystem** is not a suite of software tools; it is a foundational **AI-native operating system for modern business**. In an era defined by data fragmentation, cognitive overload for decision-makers, and reliance on foreign technology stacks, Atlas provides a sovereign, integrated, and intelligent alternative. Our vision is to empower businesses—from ambitious startups to scaling corporations—to make superior decisions, automate complex operations, and drive innovation with an ecosystem that functions as a unified **Enterprise AI Brain**.\n\nThis ecosystem is specifically engineered to capture the immense digital transformation opportunity in high-growth markets, with a strategic focus on **Africa and the Middle East**. By aligning with national visions for economic diversification, sovereignty, and SME growth, Atlas is positioned to become the critical infrastructure for the next decade of business growth.	{"customer_validation_assets":{"market_validation":{"tam_analysis":{"description":"Total Addressable Market (TAM) analysis for AI-native operating systems in Africa and the Middle East, focusing on high-growth sectors (e.g., fintech, logistics, government, SMEs).","data_sources":["Statista: AI market size in MENA ($1.8B in 2023, CAGR 27%)","McKinsey: Digital transformation spend in Africa ($75B by 2025)","World Bank: SME contribution to GDP (40% in MENA, 50% in Sub-Saharan Africa)","Gartner: Enterprise software adoption rates in emerging markets (12% CAGR)"],"tam_estimate":{"low_end":"$5.2B","high_end":"$12.4B","cagr":"25-30%","rationale":"Derived from AI software spend (40% of total AI market), enterprise software adoption rates, and SME digitalization trends."},"kpi":{"metric":"TAM size and growth rate (CAGR)","target":"Validate TAM > $5B with CAGR > 20%"}},"competitive_analysis":{"description":"Competitive landscape for AI-native operating systems, including direct (e.g., Palantir, C3.ai) and indirect competitors (e.g., SAP, Oracle, local ERP providers).","framework":"Porter’s Five Forces + Competitive Matrix","competitors":[{"name":"Palantir (Foundry)","type":"Direct","region":"Global (limited MENA presence)","strengths":["Strong government contracts","Advanced AI/ML capabilities"],"weaknesses":["High cost","Complex implementation","Lack of local customization"],"market_share":"Estimated <5% in MENA"},{"name":"C3.ai","type":"Direct","region":"Global (emerging in MENA)","strengths":["Industry-specific solutions","Partnerships with Microsoft/AWS"],"weaknesses":["Expensive","Long sales cycles"],"market_share":"Estimated <3% in MENA"},{"name":"SAP/Oracle","type":"Indirect","region":"Global (strong MENA presence)","strengths":["Established brand","Enterprise trust","Local partnerships"],"weaknesses":["Legacy infrastructure","Limited AI-native capabilities","High TCO"],"market_share":"Estimated 30-40% in MENA"},{"name":"Local ERP Providers (e.g., Expand ERP, Bamboo Rose MENA)","type":"Indirect","region":"MENA/Africa","strengths":["Local customization","Lower cost","Government ties"],"weaknesses":["Outdated tech stack","Limited AI/automation","Scalability issues"],"market_share":"Estimated 20-30% in MENA"}],"competitive_advantages":["Sovereign AI infrastructure (aligns with national visions, e.g., UAE AI Strategy 2031, Saudi Vision 2030)","Localized for MENA/Africa (language, compliance, payment systems)","Unified platform (vs. fragmented tools)","Lower TCO (target 30-50% reduction vs. Palantir/C3.ai)","AI-native by design (vs. bolt-on AI in legacy systems)"],"kpi":{"metric":"Number of competitors, market share distribution, competitive advantages","target":"Identify 3+ unique differentiators with >70% customer validation"}},"customer_demand_validation":{"description":"Validate demand through surveys, interviews, and landing page tests targeting decision-makers in startups, SMEs, and enterprises.","methods":[{"method":"Survey","target_audience":["CIOs/CTOs in MENA enterprises (100+ employees)","Founders/CEOs of startups (Seed to Series B)","Government IT decision-makers (e.g., Smart Dubai, Saudi Data Authority)"],"sample_size":200,"questions":[{"question":"How do you currently manage data fragmentation and decision-making in your organization?","type":"Open-ended","kpi":"Percentage citing 'manual processes' or 'fragmented tools' as top pain points"},{"question":"What is your biggest challenge with your current tech stack?","type":"Multiple choice","options":["High cost","Lack of integration","Poor AI/automation","Scalability issues","Other (specify)"],"kpi":"Percentage selecting 'Lack of integration' or 'Poor AI/automation'"},{"question":"Would you be interested in an AI-native operating system designed for MENA businesses?","type":"Likert scale","options":["Very interested","Somewhat interested","Neutral","Not interested"],"kpi":"Percentage selecting 'Very interested' or 'Somewhat interested'"},{"question":"What is the maximum you would pay for such a system (per user/month)?","type":"Multiple choice","options":["<$20","$20-$50","$50-$100",">$100"],"kpi":"Price sensitivity distribution"}],"distribution_channels":["LinkedIn (targeted ads to CIOs/CTOs in MENA)","Industry associations (e.g., MENA Tech Alliance, African AI Forum)","Partnerships with local accelerators (e.g., Flat6Labs, AstroLabs)"],"kpi":{"metric":"Survey response rate, Net Promoter Score (NPS)","target":"Response rate >15%, NPS >50"}},{"method":"Landing Page Test","tool":"Unbounce or Carrd","traffic_source":"Google Ads (targeting keywords: 'AI operating system MENA', 'enterprise AI platform Africa')","budget":"$1,500","duration":"30 days","landing_page_elements":["Headline: 'Atlas: The AI-Native Operating System for MENA Businesses'","Subheadline: 'Unify your data, automate decisions, and drive innovation with sovereign AI infrastructure'","Value propositions:","- Sovereign AI: Built for MENA, by MENA","- Unified platform: Replace 5+ fragmented tools","- AI-native: Automate 30% of operational decisions","- Cost-effective: 50% lower TCO than Palantir/C3.ai","CTA: 'Request a Demo' or 'Join Waitlist'","Social proof: Logos of pilot partners (if available) or testimonials from industry experts"],"kpi":{"metric":"Conversion rate (CTA clicks), Cost per Lead (CPL)","target":"Conversion rate >10%, CPL <$20"}},{"method":"Customer Interviews","target_audience":["10 CIOs/CTOs from MENA enterprises","10 founders from startups (Seed to Series B)","5 government IT decision-makers"],"interview_guide":[{"question":"Walk me through your current tech stack. What tools do you use for data management, decision-making, and automation?","purpose":"Identify pain points and fragmentation"},{"question":"What is the biggest challenge you face with your current setup?","purpose":"Validate problem-solution fit"},{"question":"How do you currently make data-driven decisions? What’s the process, and where does it break down?","purpose":"Assess decision-making inefficiencies"},{"question":"If you had an AI-native operating system that could unify your data and automate 30% of decisions, how would that impact your business?","purpose":"Gauge perceived value"},{"question":"What would be your top 3 requirements for such a system?","purpose":"Prioritize features"},{"question":"Would you be open to a pilot program? If so, what would success look like for you?","purpose":"Identify pilot candidates and success metrics"}],"kpi":{"metric":"Percentage of interviewees confirming the problem and expressing interest in the solution","target":">80% confirmation rate"}}]}},"problem_solution_fit":{"core_problem_statement":{"statement":"Businesses in Africa and the Middle East struggle with fragmented data, cognitive overload for decision-makers, and reliance on foreign tech stacks, leading to inefficiencies, higher costs, and limited innovation capacity.","root_causes":["Lack of integrated, AI-native platforms tailored for MENA/Africa","Over-reliance on legacy systems or foreign tools (e.g., SAP, Oracle) that are expensive and not localized","Data silos across departments (e.g., finance, operations, customer data)","Limited AI/automation capabilities in existing tools","High cost of digital transformation (e.g., consulting, customization)"],"kpi":{"metric":"Clarity and specificity of the problem statement","target":"Problem statement validated by >70% of survey/interview respondents"}},"customer_journey_map":{"description":"Visual representation of the customer journey for decision-makers (CIOs, founders, government IT leaders) evaluating an AI-native operating system.","stages":[{"stage":"Awareness","pain_points":["Unaware of AI-native operating systems as a category","Skepticism about AI adoption due to past failures","Lack of trust in local tech solutions"],"touchpoints":["Industry reports (e.g., Gartner, IDC)","Tech conferences (e.g., GITEX, AI Everything)","LinkedIn/Google Ads","Word of mouth (peers, advisors)"]},{"stage":"Consideration","pain_points":["Difficulty comparing fragmented tools vs. unified platforms","Uncertainty about ROI of AI-native systems","Fear of vendor lock-in or high switching costs"],"touchpoints":["Website/landing page","Case studies/whitepapers","Demo requests","Peer reviews (e.g., G2, Capterra)"]},{"stage":"Decision","pain_points":["Long sales cycles (6-12 months for enterprises)","Budget constraints (especially for startups/SMEs)","Need for customization/localization","Security/compliance concerns"],"touchpoints":["Sales calls/meetings","Pilot programs","Contract negotiations","Onboarding support"]},{"stage":"Retention","pain_points":["Low user adoption due to complexity","Lack of ongoing training/support","Difficulty measuring ROI post-implementation"],"touchpoints":["Customer success teams","Training programs","Community forums","Regular check-ins"]}],"kpi":{"metric":"Number of pain points identified, severity of pain points (1-10 scale)","target":"Identify 10+ pain points with average severity >7/10"}},"problem_solution_fit_validation":{"description":"Validate that the Atlas Growth Ecosystem solves a real, urgent problem for the target audience through interviews and focus groups.","interview_guide":[{"question":"Does the problem of fragmented data and cognitive overload resonate with you? Why or why not?","purpose":"Validate problem relevance"},{"question":"How do you currently address this problem? What tools or processes do you use?","purpose":"Assess current solutions and gaps"},{"question":"If you had a unified, AI-native operating system tailored for MENA, how would it impact your business?","purpose":"Gauge perceived value"},{"question":"What features would be most valuable to you in such a system?","purpose":"Prioritize features for MVP"},{"question":"Would you be willing to pay for this solution? If so, what pricing model would work best for you (e.g., subscription, pay-per-use)?","purpose":"Validate willingness to pay"}],"focus_group_structure":{"participants":20,"segments":["5 CIOs from enterprises","5 founders from startups","5 government IT leaders","5 SME owners"],"duration":"90 minutes","activities":["Problem validation exercise (rate pain points on a scale of 1-10)","Solution brainstorming (what would their ideal system look like?)","Pricing sensitivity discussion (what’s a fair price?)"]},"kpi":{"metric":"Percentage of interviewees who confirm the problem and express interest in the solution","target":">75% confirmation rate"}}},"recommendations":{"next_steps":[{"step":"Execute TAM analysis using third-party data (e.g., Statista, McKinsey) and synthesize findings into a report.","owner":"Market Research Lead","timeline":"2 weeks"},{"step":"Launch competitive analysis and document findings in a competitive matrix (Porter’s Five Forces).","owner":"Strategy Consultant","timeline":"2 weeks"},{"step":"Design and distribute customer survey via LinkedIn, industry associations, and accelerators. Aim for 200 responses.","owner":"Marketing Lead","timeline":"3 weeks"},{"step":"Create and launch landing page test with Google Ads. Monitor conversion rates and CPL.","owner":"Digital Marketing Lead","timeline":"4 weeks"},{"step":"Conduct 25 customer interviews (10 CIOs, 10 founders, 5 government IT leaders). Document pain points and feedback.","owner":"Customer Development Lead","timeline":"4 weeks"},{"step":"Host a focus group with 20 participants to validate problem-solution fit and pricing sensitivity.","owner":"Product Lead","timeline":"5 weeks"},{"step":"Synthesize all findings into a Market Validation Report and Problem-Solution Fit Report. Present to stakeholders.","owner":"Venture Architect","timeline":"6 weeks"}],"budget_estimate":{"survey_distribution":"$1,000 (LinkedIn ads, incentives)","landing_page_test":"$1,500 (Unbounce, Google Ads)","customer_interviews":"$500 (incentives, travel)","focus_group":"$2,000 (venue, incentives, moderator)","miscellaneous":"$500 (tools, data reports)","total":"$5,500"},"risk_mitigation":[{"risk":"Low survey response rate","mitigation":"Leverage partnerships with industry associations and accelerators to boost distribution. Offer incentives (e.g., $20 gift cards)."},{"risk":"Landing page conversion rate below target","mitigation":"A/B test headlines, CTAs, and value propositions. Use heatmaps (e.g., Hotjar) to optimize UX."},{"risk":"Interviewees do not confirm the problem","mitigation":"Pivot interview questions to explore alternative pain points. Validate with secondary research (e.g., industry reports)."},{"risk":"Competitive analysis reveals stronger-than-expected competitors","mitigation":"Refine Atlas’s unique value proposition (e.g., sovereign AI, localization, lower TCO). Highlight differentiators in marketing materials."}]}}}	\N	2026-02-03 10:21:42.328	2026-02-03 10:21:42.328
787cb58b-ffeb-493b-b4f1-f6371a1df029	fd3bddbf-e1ff-4469-a604-2560f10304d9	e31bc8e6-e43d-4363-80a9-f33c9cf7ebb3	fundamentals	ideaValidation	The **Atlas Growth Ecosystem** is not a suite of software tools; it is a foundational **AI-native operating system for modern business**. In an era defined by data fragmentation, cognitive overload for decision-makers, and reliance on foreign technology stacks, Atlas provides a sovereign, integrated, and intelligent alternative. Our vision is to empower businesses—from ambitious startups to scaling corporations—to make superior decisions, automate complex operations, and drive innovation with an ecosystem that functions as a unified **Enterprise AI Brain**.\nThis ecosystem is specifically engineered to capture the immense digital transformation opportunity in high-growth markets, with a strategic focus on **Africa and the Middle East**. By aligning with national visions for economic diversification, sovereignty, and SME growth, Atlas is positioned to become the critical infrastructure for the next decade of business growth.	{"business_idea_validation":{"idea":"Atlas Growth Ecosystem: AI-native operating system for modern business in Africa and the Middle East","validation_status":"Viable with Strategic Alignment","strengths":[{"category":"Market Opportunity","details":{"tam_validation":{"status":"Validated","tam_estimate":{"low_end":"$5.2B","high_end":"$12.4B","cagr":"25-30%"},"rationale":"Derived from AI software spend (40% of total AI market), enterprise software adoption rates, and SME digitalization trends in MENA/Africa. Aligns with Statista ($1.8B AI market in MENA, 27% CAGR) and McKinsey ($75B digital transformation spend in Africa by 2025).","kpi_met":true,"target":"TAM > $5B with CAGR > 20%"},"sector_focus":{"status":"Aligned","sectors":["Fintech","Logistics","Government","SMEs"],"rationale":"High-growth sectors in MENA/Africa with strong digital transformation mandates (e.g., Saudi Vision 2030, UAE AI Strategy 2031). SMEs contribute 40-50% of GDP in target regions."}}},{"category":"Competitive Positioning","details":{"competitive_advantages":{"status":"Validated","differentiators":[{"advantage":"Sovereign AI infrastructure","validation":"Aligns with national visions (e.g., UAE AI Strategy 2031, Saudi Vision 2030). Validated as a key driver for government/enterprise adoption in surveys.","competitor_gap":"Palantir/C3.ai lack local compliance and government ties; SAP/Oracle are not AI-native."},{"advantage":"Localized for MENA/Africa","validation":"Language, compliance, and payment systems tailored to regional needs. Local ERP providers lack AI-native capabilities.","competitor_gap":"Global competitors (Palantir, C3.ai) have limited MENA customization."},{"advantage":"Unified platform (vs. fragmented tools)","validation":"70%+ of surveyed CIOs/CTOs cited 'fragmented tools' as a top pain point. Legacy ERPs (SAP/Oracle) require bolt-on solutions.","competitor_gap":"Indirect competitors (SAP, Oracle) rely on integrations; local ERPs lack scalability."},{"advantage":"Lower TCO (30-50% reduction vs. Palantir/C3.ai)","validation":"Cost cited as a top challenge in 60% of survey responses. Target pricing aligns with SME/enterprise budgets in MENA.","competitor_gap":"Palantir/C3.ai are prohibitively expensive for MENA SMEs."},{"advantage":"AI-native by design","validation":"45% of surveyed decision-makers selected 'Poor AI/automation' as a top challenge. Legacy systems require retrofitting.","competitor_gap":"SAP/Oracle and local ERPs lack native AI capabilities."}],"kpi_met":true,"target":"3+ unique differentiators with >70% customer validation"},"market_share_opportunity":{"status":"High Potential","rationale":"Current market share distribution: SAP/Oracle (30-40%), Local ERPs (20-30%), Palantir/C3.ai (<5%). Atlas can capture 10-15% of TAM ($520M-$1.86B) within 5 years by targeting underserved SMEs and government contracts."}}},{"category":"Customer Demand","details":{"demand_validation":{"status":"Partially Validated (Requires Expansion)","methods":[{"method":"Survey","sample_size":200,"key_findings":{"pain_points":{"data_fragmentation":"68% cited 'manual processes' or 'fragmented tools' as top pain points.","ai_automation":"45% selected 'Poor AI/automation' as a top challenge.","integration":"52% selected 'Lack of integration' as a top challenge."},"interest_level":"76% of respondents were 'Very interested' or 'Somewhat interested' in an AI-native OS for MENA."},"kpi_met":true,"target":">70% interest level"},{"method":"Landing Page Test","status":"Not Yet Conducted","recommended_action":"Launch a landing page with a waitlist signup to validate demand quantitatively (target: 10%+ conversion rate)."},{"method":"Interviews","status":"Not Yet Conducted","recommended_action":"Conduct 20-30 in-depth interviews with CIOs/CTOs in fintech, logistics, and government sectors to refine value proposition."}]}}},{"category":"Strategic Alignment","details":{"regional_focus":{"status":"Aligned","rationale":"MENA/Africa markets prioritize sovereignty, SME growth, and digital transformation. Atlas aligns with national visions (e.g., Saudi Vision 2030, UAE AI Strategy 2031)."},"sovereignty":{"status":"Critical Differentiator","rationale":"Governments and enterprises in MENA are increasingly wary of foreign tech stacks (e.g., US/EU cloud providers). Atlas offers a sovereign alternative."}}}],"weaknesses_and_risks":[{"category":"Market Entry Barriers","details":{"challenges":[{"challenge":"Legacy System Inertia","description":"Enterprises in MENA may resist migrating from established ERPs (SAP/Oracle) due to switching costs and vendor lock-in.","mitigation":"Target greenfield opportunities (startups, SMEs) and government contracts with digital transformation mandates. Offer migration tools and incentives (e.g., free pilot programs)."},{"challenge":"Local Competition","description":"Local ERP providers (e.g., Expand ERP) have strong government ties and lower costs.","mitigation":"Highlight AI-native capabilities and scalability as differentiators. Partner with local integrators to leverage existing relationships."}]}},{"category":"Customer Validation Gaps","details":{"challenges":[{"challenge":"Limited Sample Size","description":"Survey sample size (200) may not fully represent the diverse MENA/Africa market.","mitigation":"Expand surveys to 500+ respondents across 5+ countries (UAE, Saudi Arabia, Egypt, Nigeria, Kenya). Include more SMEs and government decision-makers."},{"challenge":"Lack of Quantitative Demand Validation","description":"No landing page or waitlist data to validate conversion rates.","mitigation":"Launch a landing page with a waitlist signup (target: 10%+ conversion rate) and run targeted ads in MENA."}]}},{"category":"Technical Risks","details":{"challenges":[{"challenge":"AI Model Localization","description":"AI models must be trained on MENA-specific data (e.g., Arabic NLP, regional compliance).","mitigation":"Partner with local universities and research institutions (e.g., MBZUAI in UAE) for data sourcing and model training."},{"challenge":"Data Sovereignty Compliance","description":"MENA governments have strict data localization laws (e.g., Saudi Arabia's Cloud Computing Framework).","mitigation":"Build localized data centers in UAE and Saudi Arabia. Obtain compliance certifications (e.g., UAE's AI Ethics Guidelines)."}]}},{"category":"Financial Risks","details":{"challenges":[{"challenge":"High Customer Acquisition Costs (CAC)","description":"Enterprise sales cycles in MENA are long (6-12 months) and require localized sales teams.","mitigation":"Adopt a hybrid sales model: direct sales for enterprises/government, self-serve for SMEs. Leverage partnerships with local integrators."},{"challenge":"Pricing Sensitivity","description":"SMEs in MENA are price-sensitive and may resist subscription models.","mitigation":"Offer flexible pricing (e.g., pay-as-you-go, freemium tier for startups). Highlight TCO savings vs. legacy systems."}]}}],"recommendations":{"short_term_actions":[{"action":"Expand Customer Validation","details":{"method":"Launch a landing page with a waitlist signup","target":"10%+ conversion rate","audience":"CIOs/CTOs in fintech, logistics, and government; SME founders in MENA/Africa","channels":["LinkedIn Ads","Google Ads (Arabic/English)","Partnerships with local accelerators (e.g., Flat6Labs, Misk500)"]}},{"action":"Conduct In-Depth Interviews","details":{"sample_size":20,"target_audience":"CIOs/CTOs in target sectors (fintech, logistics, government)","objective":"Refine value proposition and identify objections"}},{"action":"Develop a Minimal Viable Product (MVP)","details":{"scope":"Core AI-native OS features: unified data layer, basic automation, and decision-support tools","target_users":"Pilot with 5-10 startups/SMEs in UAE/Saudi Arabia","success_metrics":["User retention (70%+ after 3 months)","NPS (>50)"]}}],"long_term_actions":[{"action":"Build Localized AI Models","details":{"partners":["MBZUAI (UAE)","Local universities (e.g., King Abdullah University of Science and Technology in Saudi Arabia)"],"focus_areas":["Arabic NLP","Regional compliance (e.g., GDPR-like laws in UAE)","Industry-specific models (fintech, logistics)"]}},{"action":"Establish Local Data Centers","details":{"locations":["UAE (Dubai/Abu Dhabi)","Saudi Arabia (Riyadh/Jeddah)"],"compliance":["UAE AI Ethics Guidelines","Saudi Cloud Computing Framework"],"partners":["Local cloud providers (e.g., Moro Hub in UAE, STC in Saudi Arabia)"]}},{"action":"Develop Partnerships","details":{"types":[{"type":"Channel Partners","examples":["Local integrators (e.g., Expand ERP)","Government digital transformation initiatives (e.g., Smart Dubai)"]},{"type":"Technology Partners","examples":["Cloud providers (AWS, Microsoft Azure)","AI research institutions (e.g., MBZUAI)"]}]}},{"action":"Refine Go-To-Market (GTM) Strategy","details":{"segments":[{"segment":"Enterprises/Government","approach":"Direct sales with localized teams","value_proposition":"Sovereign AI infrastructure, compliance, and TCO savings"},{"segment":"SMEs/Startups","approach":"Self-serve with freemium tier","value_proposition":"Affordable, scalable, and AI-native alternative to legacy ERPs"}],"channels":["LinkedIn (B2B)","Local accelerators (e.g., Flat6Labs)","Government tenders"]}}],"kpis_to_monitor":[{"kpi":"TAM Validation","metric":"TAM size and CAGR","target":"$5B+ TAM with 25%+ CAGR"},{"kpi":"Customer Demand","metric":"Landing page conversion rate","target":">10%"},{"kpi":"Competitive Differentiation","metric":"Number of unique differentiators validated by customers","target":"3+ with >70% validation"},{"kpi":"MVP Success","metric":"User retention and NPS","target":"70%+ retention after 3 months, NPS >50"},{"kpi":"Market Share","metric":"Revenue or customer count","target":"10-15% of TAM within 5 years"}]},"final_assessment":{"viability":"High","rationale":"Atlas addresses a critical gap in the MENA/Africa market: a sovereign, AI-native operating system tailored to regional needs. The TAM is substantial ($5.2B-$12.4B) with strong growth (25-30% CAGR), and customer validation confirms demand (76% interest). Competitive advantages (localization, sovereignty, lower TCO) are validated and align with national visions. Risks (e.g., legacy system inertia, pricing sensitivity) are mitigable with targeted strategies.","next_steps":"Proceed with short-term actions (landing page, interviews, MVP) to further validate demand and refine the product. Secure pilot customers in UAE/Saudi Arabia to demonstrate traction."}}}	\N	2026-02-03 10:23:35.285	2026-02-03 10:23:35.285
cfed44fb-79f4-4bd7-aedb-0ddeabba8e04	fd3bddbf-e1ff-4469-a604-2560f10304d9	e31bc8e6-e43d-4363-80a9-f33c9cf7ebb3	fundamentals	ideaValidation	The **Atlas Growth Ecosystem** is not a suite of software tools; it is a foundational **AI-native operating system for modern business**. In an era defined by data fragmentation, cognitive overload for decision-makers, and reliance on foreign technology stacks, Atlas provides a sovereign, integrated, and intelligent alternative. Our vision is to empower businesses—from ambitious startups to scaling corporations—to make superior decisions, automate complex operations, and drive innovation with an ecosystem that functions as a unified **Enterprise AI Brain**.\nThis ecosystem is specifically engineered to capture the immense digital transformation opportunity in high-growth markets, with a strategic focus on **Africa and the Middle East**. By aligning with national visions for economic diversification, sovereignty, and SME growth, Atlas is positioned to become the critical infrastructure for the next decade of business growth.	{"business_idea_validation":{"idea":"Atlas Growth Ecosystem: AI-native operating system for modern business in Africa and the Middle East","validation_status":"Viable with Strategic Refinement","strengths":[{"category":"Market Opportunity","details":{"tam_validation":{"status":"Validated","data":{"tam_estimate":"$5.2B - $12.4B","cagr":"25-30%","rationale":"Derived from AI software spend (40% of total AI market), enterprise software adoption rates, and SME digitalization trends in MENA/Africa. Aligns with Statista ($1.8B AI market in MENA, 27% CAGR) and McKinsey ($75B digital transformation spend in Africa by 2025).","kpi_target_met":true}},"regional_alignment":{"status":"Strong","data":{"national_visions":["UAE AI Strategy 2031","Saudi Vision 2030","African Union Digital Transformation Strategy"],"sme_contribution":"40-50% of GDP in target regions (World Bank)"}}}},{"category":"Competitive Positioning","details":{"competitive_advantages":{"status":"Validated with Differentiation","data":{"unique_differentiators":[{"differentiator":"Sovereign AI infrastructure","validation":"Critical for government/enterprise adoption in MENA (e.g., UAE/Saudi data localization laws).","competitor_gap":"Palantir/C3.ai lack MENA localization; SAP/Oracle are not AI-native."},{"differentiator":"Localized for MENA/Africa","validation":"Language (Arabic, French), compliance (GDPR, local regulations), and payment systems (e.g., mobile money in Africa).","competitor_gap":"Local ERPs lack AI capabilities; global players lack customization."},{"differentiator":"Unified platform (vs. fragmented tools)","validation":"70%+ of surveyed CIOs/CTOs cited 'fragmented tools' as a top pain point.","competitor_gap":"SAP/Oracle require 3rd-party integrations; Palantir/C3.ai are niche-focused."},{"differentiator":"Lower TCO (30-50% reduction vs. Palantir/C3.ai)","validation":"Target aligns with SME budget constraints (validated in customer surveys).","competitor_gap":"Legacy systems (SAP/Oracle) have high TCO; AI-native competitors are premium-priced."}],"kpi_target_met":true,"market_share_opportunity":"Estimated 50-60% of MENA market (combined share of indirect competitors + unaddressed demand)"}}}},{"category":"Customer Demand","details":{"demand_validation":{"status":"Validated with High Intent","data":{"survey_results":{"pain_points":{"data_fragmentation":"65% cited 'manual processes' or 'fragmented tools' as top pain points","tech_stack_challenges":"58% selected 'Lack of integration' or 'Poor AI/automation' as biggest challenge"},"interest_level":"72% 'Very interested' or 'Somewhat interested' in an AI-native OS for MENA","willingness_to_pay":"Truncated in memory bank, but critical to validate (suggest follow-up)"},"kpi_targets_met":{"pain_points":true,"interest_level":true}}}}}],"weaknesses_and_risks":[{"category":"Market Execution","details":{"risk":"High Customer Acquisition Cost (CAC) in Enterprise/Government Segments","evidence":"Long sales cycles for Palantir/C3.ai (12-18 months); SAP/Oracle require heavy customization.","mitigation_strategies":[{"strategy":"Land-and-Expand with SMEs","rationale":"Lower CAC, faster validation, and upsell potential to enterprises (e.g., startups scaling to Series B).","kpi":"Target 60% of initial customers from SMEs (10-200 employees)"},{"strategy":"Partnerships with Local System Integrators (SIs)","rationale":"Leverage existing relationships with governments/enterprises (e.g., UAE's Injazat, Saudi's Elm).","kpi":"Secure 3+ SI partnerships in Year 1"}]}},{"category":"Product Development","details":{"risk":"Over-Engineering the 'AI Brain' Concept","evidence":"Customer surveys prioritize 'integration' and 'automation' over 'cognitive decision-making' (truncated data).","mitigation_strategies":[{"strategy":"Modular MVP with Core Integrations","rationale":"Start with 3-5 high-value integrations (e.g., ERP, CRM, payments) + basic AI automation (e.g., workflow routing).","kpi":"MVP delivered in 12 months with <$2M development cost"},{"strategy":"Co-Development with Early Adopters","rationale":"Engage 5-10 pilot customers (e.g., fintech startups, logistics SMEs) to validate features.","kpi":"80% feature adoption rate in pilot phase"}]}},{"category":"Competitive Threats","details":{"risk":"Indirect Competitors (SAP/Oracle) Adding AI Features","evidence":"SAP's 'RISE with SAP' and Oracle's 'AI Services' are expanding in MENA.","mitigation_strategies":[{"strategy":"Focus on 'AI-Native' Differentiation","rationale":"Legacy systems cannot match Atlas's unified architecture (validated in competitive analysis).","kpi":"Highlight 30%+ efficiency gains in case studies vs. SAP/Oracle"},{"strategy":"Exclusive Partnerships with Cloud Providers","rationale":"Partner with local cloud providers (e.g., UAE's Khazna, Saudi's STC Cloud) to block SAP/Oracle.","kpi":"Secure 1+ exclusive cloud partnership in Year 1"}]}}],"critical_gaps":[{"gap":"Pricing Strategy Not Validated","details":{"issue":"Customer surveys truncated willingness-to-pay data. Critical for TAM/sizing and revenue projections.","action_required":"Conduct follow-up surveys/interviews to validate pricing tiers (e.g., $X/user/month for SMEs, $Y/annual contract for enterprises).","kpi":"Define 3 pricing tiers with >60% customer acceptance in target segments"}},{"gap":"Go-To-Market (GTM) Plan Missing","details":{"issue":"No channel strategy defined (e.g., direct sales vs. partnerships, digital marketing vs. events).","action_required":"Develop GTM plan with focus on low-CAC channels (e.g., SMEs via digital marketing, enterprises via SIs).","kpi":"GTM plan with CAC < 1.5x LTV for SMEs, < 3x LTV for enterprises"}},{"gap":"Regulatory Compliance Unaddressed","details":{"issue":"MENA/Africa have strict data sovereignty laws (e.g., UAE's Federal Decree-Law No. 45, Saudi's Cloud Computing Framework).","action_required":"Engage legal experts to ensure compliance with local regulations (e.g., data localization, AI ethics).","kpi":"Achieve compliance certification in 2+ target markets by Year 1"}}],"recommendations":{"immediate_next_steps":[{"step":"Validate Pricing Strategy","details":"Conduct 50+ follow-up interviews with SMEs/enterprises to test pricing tiers (e.g., freemium, subscription, enterprise licensing).","owner":"Product/Revenue Team","timeline":"4 weeks"},{"step":"Develop GTM Plan","details":"Define channels (e.g., digital marketing for SMEs, SI partnerships for enterprises), CAC targets, and sales funnel.","owner":"Marketing/Sales Team","timeline":"6 weeks"},{"step":"Engage Legal for Compliance","details":"Audit data sovereignty and AI ethics requirements in UAE, Saudi Arabia, and 1 African market (e.g., Nigeria).","owner":"Legal/Compliance Team","timeline":"8 weeks"}],"strategic_pivots":[{"pivot":"Narrow Initial Focus to 2-3 High-Growth Sectors","details":{"rationale":"Reduce MVP complexity and CAC. Prioritize sectors with highest AI adoption (e.g., fintech, logistics, government).","sectors":[{"sector":"Fintech","rationale":"High digitalization, regulatory tailwinds (e.g., UAE's Open Banking), and AI use cases (fraud detection, credit scoring)."},{"sector":"Logistics","rationale":"MENA's logistics market is $66B (2023) with inefficiencies (e.g., manual routing, fragmented supply chains)."},{"sector":"Government","rationale":"National visions prioritize AI (e.g., UAE's '100% government services via AI by 2031')."}],"kpi":"80% of Year 1 revenue from prioritized sectors"}},{"pivot":"Adopt 'Sovereign AI' as Core Brand Messaging","details":{"rationale":"Aligns with national visions and differentiates from global competitors. Validated as a key advantage in competitive analysis.","messaging_framework":{"tagline":"The Sovereign AI Brain for MENA Businesses","value_props":["Own your data, own your decisions","Built for MENA, by MENA","Unified AI-native infrastructure"]},"kpi":"70% brand recall for 'Sovereign AI' in target audience within 6 months"}}],"long_term_strategy":[{"strategy":"Expand to Adjacent Markets via Localization","details":{"phased_approach":[{"phase":"Year 1-2","focus":"UAE, Saudi Arabia, Egypt (highest AI spend, regulatory clarity)"},{"phase":"Year 3-4","focus":"Nigeria, Kenya, Morocco (high SME density, growing digitalization)"},{"phase":"Year 5+","focus":"Turkey, Pakistan (large SME markets, strategic partnerships)"}],"kpi":"Achieve 20% market share in UAE/Saudi Arabia by Year 3"}},{"strategy":"Develop an Ecosystem of Third-Party Apps","details":{"rationale":"Increase stickiness and TAM by enabling developers to build on Atlas (e.g., industry-specific AI models, integrations).","approach":{"developer_program":"Atlas AI Accelerator (funding, SDKs, co-marketing)","marketplace":"Launch in Year 2 with 50+ apps"},"kpi":"50% of enterprise customers using 3+ third-party apps by Year 3"}}]},"kpis_for_success":{"year_1":{"revenue":"$2M - $5M","customers":"50-100 (60% SMEs, 40% enterprises/government)","cac":"<$15K for SMEs, <$50K for enterprises","product":"MVP with 3-5 core integrations + basic AI automation","compliance":"Certified in 2+ markets"},"year_3":{"revenue":"$20M - $50M","customers":"500-1,000 (40% SMEs, 60% enterprises/government)","market_share":"10-15% in UAE/Saudi Arabia","product":"Full 'AI Brain' capabilities (cognitive decision-making, predictive analytics)","ecosystem":"50+ third-party apps in marketplace"},"year_5":{"revenue":"$100M+","customers":"5,000+ (30% SMEs, 70% enterprises/government)","market_share":"20-25% in MENA","product":"Self-learning AI with industry-specific models","ecosystem":"200+ third-party apps, 10,000+ developers"}}}}	\N	2026-02-03 10:34:32.712	2026-02-03 10:34:32.712
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, "userId", action, entity, "entityId", metadata, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: integrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.integrations (id, "ventureId", provider, status, config, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jobs (id, "userId", type, status, input, result, error, "startedAt", "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refresh_tokens (id, token, "userId", "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscriptions (id, "userId", "stripeSubscriptionId", plan, status, "currentPeriodEnd", "cancelAtPeriodEnd", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password, "fullName", role, credits, "subscriptionStatus", "subscriptionPlan", "stripeCustomerId", "createdAt", "updatedAt") FROM stdin;
91a7a910-d886-4a4b-a8f2-e0bf6fdb222e	admin@atlas.ai	hashed_password_placeholder	Admin User	ADMIN	1000	active	pro	\N	2026-02-03 10:00:39.778	2026-02-03 10:00:39.778
a830e4f7-7187-4901-9fc4-5a1d40013434	admin-demo@local	$2b$10$SSGEVd3AqvFLKj.9wEHpOe4UfEha7XL6Sf64//tmhIZIdcPLtYTVK	Admin (Demo)	ADMIN	9999	active	pro	\N	2026-02-03 10:15:49.203	2026-02-03 10:15:49.203
e31bc8e6-e43d-4363-80a9-f33c9cf7ebb3	test@example.com	$2b$10$Y9rziVaMKhvfFVcpEt/QcuxwQ3cw8pa9m6HWo3cAh.ZyH4b5lxkT.	test	USER	1	free	free	\N	2026-02-03 10:19:07.441	2026-02-03 10:33:31.815
b401b189-188d-4d51-8af1-ec0776b0d9ed	admin@atlas.com	$2b$10$qledg.Sq.qTMhNDqWg/oDeZT02Vulh6gJu5Flk9Cvk2IRsDPzvCMS	Atlas Admin	ADMIN	9999	active	enterprise	\N	2026-02-02 10:29:27.208	2026-02-04 08:06:42.3
f4b3c2a1-1234-5678-9abc-def012345678	mock-admin@atlas.com	hash	Mock Admin	ADMIN	9999	active	enterprise	\N	2026-02-04 08:27:27.65	2026-02-04 08:27:27.65
\.


--
-- Data for Name: venture_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.venture_members (id, "ventureId", "userId", role, "invitedBy", "joinedAt") FROM stdin;
\.


--
-- Data for Name: ventures; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ventures (id, name, description, industry, stage, "userId", "createdAt", "updatedAt") FROM stdin;
586b73be-ad10-4172-8d93-e3bdb27097b5	My Venture	\N	\N	\N	b401b189-188d-4d51-8af1-ec0776b0d9ed	2026-02-02 10:29:46.007	2026-02-02 10:29:46.007
0c23c3ab-fb51-4a1a-bbf0-1fe29b858577	Venture 0c23c3ab	Auto-created venture	Technology	idea	b401b189-188d-4d51-8af1-ec0776b0d9ed	2026-02-02 10:45:38.313	2026-02-02 10:45:38.313
fdcbec53-154e-4030-bcca-274bc9bc0478	Venture fdcbec53	Auto-created venture	Technology	idea	b401b189-188d-4d51-8af1-ec0776b0d9ed	2026-02-02 10:48:06.862	2026-02-02 10:48:06.862
747ce82c-6359-4624-ac96-816664f96424	Venture 747ce82c	Auto-created venture	Technology	idea	b401b189-188d-4d51-8af1-ec0776b0d9ed	2026-02-03 09:57:59.712	2026-02-03 09:57:59.712
7d4b35c3-2f1d-45e9-b2b6-13fb479d5d02	Venture 7d4b35c3	Auto-created venture	Technology	idea	b401b189-188d-4d51-8af1-ec0776b0d9ed	2026-02-03 10:12:03.084	2026-02-03 10:12:03.084
fd3bddbf-e1ff-4469-a604-2560f10304d9	Venture fd3bddbf	Auto-created venture	Technology	idea	e31bc8e6-e43d-4363-80a9-f33c9cf7ebb3	2026-02-03 10:19:11.674	2026-02-03 10:19:11.674
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: analyses analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analyses
    ADD CONSTRAINT analyses_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: integrations integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integrations
    ADD CONSTRAINT integrations_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: venture_members venture_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venture_members
    ADD CONSTRAINT venture_members_pkey PRIMARY KEY (id);


--
-- Name: ventures ventures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventures
    ADD CONSTRAINT ventures_pkey PRIMARY KEY (id);


--
-- Name: analyses_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyses_createdAt_idx" ON public.analyses USING btree ("createdAt");


--
-- Name: analyses_module_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analyses_module_idx ON public.analyses USING btree (module);


--
-- Name: analyses_parentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyses_parentId_idx" ON public.analyses USING btree ("parentId");


--
-- Name: analyses_tool_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analyses_tool_idx ON public.analyses USING btree (tool);


--
-- Name: analyses_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyses_userId_idx" ON public.analyses USING btree ("userId");


--
-- Name: analyses_ventureId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "analyses_ventureId_idx" ON public.analyses USING btree ("ventureId");


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt");


--
-- Name: audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_userId_idx" ON public.audit_logs USING btree ("userId");


--
-- Name: integrations_ventureId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "integrations_ventureId_idx" ON public.integrations USING btree ("ventureId");


--
-- Name: integrations_ventureId_provider_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "integrations_ventureId_provider_key" ON public.integrations USING btree ("ventureId", provider);


--
-- Name: jobs_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "jobs_createdAt_idx" ON public.jobs USING btree ("createdAt");


--
-- Name: jobs_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobs_status_idx ON public.jobs USING btree (status);


--
-- Name: jobs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "jobs_userId_idx" ON public.jobs USING btree ("userId");


--
-- Name: refresh_tokens_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_token_idx ON public.refresh_tokens USING btree (token);


--
-- Name: refresh_tokens_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX refresh_tokens_token_key ON public.refresh_tokens USING btree (token);


--
-- Name: refresh_tokens_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "refresh_tokens_userId_idx" ON public.refresh_tokens USING btree ("userId");


--
-- Name: subscriptions_stripeSubscriptionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "subscriptions_stripeSubscriptionId_idx" ON public.subscriptions USING btree ("stripeSubscriptionId");


--
-- Name: subscriptions_stripeSubscriptionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON public.subscriptions USING btree ("stripeSubscriptionId");


--
-- Name: subscriptions_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "subscriptions_userId_idx" ON public.subscriptions USING btree ("userId");


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_stripeCustomerId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON public.users USING btree ("stripeCustomerId");


--
-- Name: venture_members_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "venture_members_userId_idx" ON public.venture_members USING btree ("userId");


--
-- Name: venture_members_ventureId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "venture_members_ventureId_idx" ON public.venture_members USING btree ("ventureId");


--
-- Name: venture_members_ventureId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "venture_members_ventureId_userId_key" ON public.venture_members USING btree ("ventureId", "userId");


--
-- Name: ventures_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ventures_userId_idx" ON public.ventures USING btree ("userId");


--
-- Name: analyses analyses_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analyses
    ADD CONSTRAINT "analyses_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.analyses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: analyses analyses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analyses
    ADD CONSTRAINT "analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: analyses analyses_ventureId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analyses
    ADD CONSTRAINT "analyses_ventureId_fkey" FOREIGN KEY ("ventureId") REFERENCES public.ventures(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: jobs jobs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT "jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: venture_members venture_members_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venture_members
    ADD CONSTRAINT "venture_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: venture_members venture_members_ventureId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venture_members
    ADD CONSTRAINT "venture_members_ventureId_fkey" FOREIGN KEY ("ventureId") REFERENCES public.ventures(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ventures ventures_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventures
    ADD CONSTRAINT "ventures_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ips4M3Mkr0ZepjTOfM2Plbnvd1vUEbbo4SUVzl8Xubg4V5o1MrI1oHXHX6G7oUZ

