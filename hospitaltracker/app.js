const KEY='promptalo_hospitals_v1';
const SORTKEY='promptalo_hospitals_sort';

// ---- device/vendor reference library: REAL infusion-pump products (product code FRN),
//      sourced from FDA 510(k) clearance records. This is a controlled vocabulary for the
//      tag autocomplete only. It does NOT assign any device to any hospital — you fill those
//      from your own sales/discovery intel. Free-typing any other vendor still works. ----
const VENDOR_LIBRARY=[
  'Baxter Spectrum IQ Infusion System','Baxter SIGMA Spectrum','Baxter Novum IQ LVP',
  'Baxter Novum IQ Syringe Pump','BD Alaris System (Guardrails)','ICU Medical Plum A+',
  'ICU Medical Plum Solo','ICU Medical Plum Duo','B. Braun Infusomat Space',
  'B. Braun Perfusor Space','B. Braun Outlook ES','Fresenius Kabi Agilia VP',
  'Fresenius Kabi Agilia SP','Koru Medical FreedomEdge','Koru Medical Freedom60',
  'Iradimed MRidium 3870 (MRI)','Eitan Medical Avoset','Q Core Sapphire',
  'Moog/Zevex Curlin 8000','Belmont Rapid Infuser RI-2','Deka Remunity'
];
// ---- seed: MA hospitals (public scaffold) + device tags with 3-level confidence:
//   (confirmed-fleet)    = cited public source shows it in standard clinical use / fleet
//   (confirmed-research) = cited source shows the device present at that site in a research study
//   (inferred)           = market-share hypothesis (BD Alaris >50% US LVP), NOT confirmed
//   Sources are NCT numbers (ClinicalTrials.gov) in the notes. Inferred = confirm on a call.
// ---- seed: MA/NH/RI hospitals (public scaffold) + device tags with 3-level confidence:
//   (confirmed-fleet)    = cited public source shows it in standard clinical use / fleet
//   (confirmed-research) = cited source shows the device present at that site in a research study
//   (inferred)           = market-share hypothesis (BD Alaris >50% US LVP), NOT confirmed
//   Sources are NCT numbers (ClinicalTrials.gov) in the notes. Inferred = confirm on a call.
//   Expanded-base bed counts are APPROXIMATE pending official (CHIA/state) verification. ----
const SEED=[
  {name:'Massachusetts General Hospital',state:'MA',city:'Boston',system:'Mass General Brigham',type:'Academic medical center',beds:1000,vendors:['Beta Bionics bionic pancreas (confirmed-research)','BD Alaris System (inferred)','Epic EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'CONFIRMED-RESEARCH: bihormonal bionic pancreas study, NCT02969863 — research device, not fleet. LVP fleet INFERRED (market leader), unconfirmed. Same system as Brigham. Verify. EHR CONFIRMED: MGB system-wide Epic (Brigham/Faulkner Epic Beaker; MGB on Epic since ~2016).'},
  {name:'Brigham and Women’s Hospital',state:'MA',city:'Boston',system:'Mass General Brigham',type:'Academic medical center',beds:793,vendors:['BD Alaris System (inferred)','Epic EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'INFERRED from market share + shared MGB standard with MGH. Multi-site NIRS study w/ BCH & BIDMC (NCT02601339). Fleet unconfirmed. Verify. EHR CONFIRMED: MGB system-wide Epic (Brigham/Faulkner Epic Beaker; MGB on Epic since ~2016).'},
  {name:'Baystate Medical Center',state:'MA',city:'Springfield',system:'Baystate Health',type:'Academic medical center',beds:740,vendors:['BD Alaris System (inferred)','Oracle Cerner EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Only Level 1 trauma in western MA. Device INFERRED (market leader); unconfirmed. Verify. EHR CONFIRMED: Baystate on Oracle Cerner (notable non-Epic academic system).'},
  {name:'UMass Memorial Medical Center',state:'MA',city:'Worcester',system:'UMass Memorial Health',type:'Academic medical center',beds:781,vendors:['BD Alaris System (inferred)','Epic EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Region’s only Level 1 trauma; near Ashland. Device INFERRED; unconfirmed. Verify. EHR CONFIRMED: UMass Memorial Epic go-live Oct 2017 ($700M program).'},
  {name:'Beth Israel Deaconess Medical Center',state:'MA',city:'Boston',system:'Beth Israel Lahey Health',type:'Academic medical center',beds:673,vendors:['Esophageal balloon catheter — ARDS SoC (confirmed-fleet)','BD Alaris System (inferred)','Epic EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'CONFIRMED-FLEET: esophageal balloon catheters standard of care for ARDS per NCT03715751. LVP fleet INFERRED, unconfirmed. Verify. EHR CONFIRMED: BILH unified Epic go-live June 2024 (prior: Lahey signed Epic 2013).'},
  {name:'Boston Medical Center',state:'MA',city:'Boston',system:'Boston Medical Center',type:'Academic medical center',beds:514,vendors:['Dräger ventilators (confirmed-fleet)','BD Alaris System (inferred)','Epic EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'CONFIRMED-FLEET: Dräger SmartCare ventilator weaning in MICU standard of care, NCT00606554. LVP fleet INFERRED. Largest safety-net in New England. Verify. EHR CONFIRMED: BMC Epic ("eMERGE") go-live 2015; former-Steward sites integrating onto it.'},
  {name:'Lahey Hospital & Medical Center',state:'MA',city:'Burlington',system:'Beth Israel Lahey Health',type:'Academic medical center',beds:335,vendors:['BD Alaris System (inferred)','Epic EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'INFERRED; likely follows BILH/BIDMC standard. Unconfirmed. Verify. EHR CONFIRMED: BILH unified Epic go-live June 2024 (prior: Lahey signed Epic 2013).'},
  {name:'Tufts Medical Center',state:'MA',city:'Boston',system:'Tufts Medicine',type:'Academic medical center',beds:415,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'INFERRED (market leader); unconfirmed. Tufts Medicine flagship. Verify. EHR INFERRED (high): Tufts Medicine reported Epic go-live 2022; verify.'},
  {name:'Boston Children’s Hospital',state:'MA',city:'Boston',system:'Independent',type:'Pediatric',beds:415,vendors:['Medtronic 670G insulin pump (confirmed-fleet)','BD Alaris System (inferred)','Epic EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'CONFIRMED: Medtronic 670G insulin pumps in clinical use, NCT04051632 (diabetes, not LVP). Multi-site NIRS (NCT02601339). LVP fleet INFERRED. Verify. EHR CONFIRMED: Boston Children’s switched from Cerner to Epic, go-live June 2024.'},
  {name:'UMass Memorial — Marlborough',state:'MA',city:'Marlborough',system:'UMass Memorial Health',type:'Community',beds:79,vendors:['BD Alaris System (inferred)','Epic EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Close to Ashland — warm local target. INFERRED; likely follows UMass Memorial standard. Verify. EHR CONFIRMED: UMass Memorial Epic go-live Oct 2017 ($700M program).'},
  {name:'MetroWest Medical Center',state:'MA',city:'Framingham',system:'Independent',type:'Community',beds:270,vendors:['Baxter Spectrum IQ (inferred, low confidence)','EHR: verify (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Closest acute-care to Ashland. INFERRED, LOW CONFIDENCE: anonymized ~285-bed near-Boston Baxter Spectrum IQ study (PMC9422768) fits profile but was NOT named. Could be BD Alaris. Verify — do not assert. EHR INFERRED/UNKNOWN: community hospitals commonly Meditech or Epic; verify.'},
  {name:'Newton-Wellesley Hospital',state:'MA',city:'Newton',system:'Mass General Brigham',type:'Community teaching',beds:273,vendors:['BD Alaris System (inferred)','Baxter Spectrum IQ (inferred, low confidence)','Epic EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'MGB community site near you. Two INFERRED candidates: BD Alaris (MGB standard) OR Baxter Spectrum IQ (fits anonymized ~285-bed study). Neither confirmed. Verify. EHR CONFIRMED: MGB system-wide Epic (Brigham/Faulkner Epic Beaker; MGB on Epic since ~2016).'},
  {name:'Cambridge Health Alliance',state:'MA',city:'Cambridge',system:'Cambridge Health Alliance',type:'Community teaching',beds:200,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Public safety-net. Beds approx. INFERRED; unconfirmed. Verify. EHR INFERRED: CHA reported Epic; verify.'},
  {name:'South Shore Hospital',state:'MA',city:'Weymouth',system:'Independent',type:'Community',beds:380,vendors:['BD Alaris System (inferred)','EHR: verify (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Large independent community. Beds approx. INFERRED; unconfirmed. Verify. EHR INFERRED/UNKNOWN: community hospitals commonly Meditech or Epic; verify.'},
  {name:'Lowell General Hospital',state:'MA',city:'Lowell',system:'Tufts Medicine',type:'Community',beds:300,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Tufts Medicine. Beds approx. INFERRED; may follow Tufts standard. Verify. EHR INFERRED (high): Tufts Medicine reported Epic go-live 2022; verify.'},
  {name:'Salem Hospital',state:'MA',city:'Salem',system:'Mass General Brigham',type:'Community',beds:390,vendors:['BD Alaris System (inferred)','Epic EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'MGB North Shore. Beds approx. INFERRED; may follow MGB standard. Verify. EHR CONFIRMED: MGB system-wide Epic (Brigham/Faulkner Epic Beaker; MGB on Epic since ~2016).'},
  {name:'Mount Auburn Hospital',state:'MA',city:'Cambridge',system:'Beth Israel Lahey Health',type:'Community teaching',beds:200,vendors:['BD Alaris System (inferred)','Epic EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'BILH; Harvard-affiliated. Beds approx. INFERRED; unconfirmed. Verify. EHR CONFIRMED: BILH unified Epic go-live June 2024 (prior: Lahey signed Epic 2013).'},
  {name:'Emerson Hospital',state:'MA',city:'Concord',system:'Independent',type:'Community',beds:180,vendors:['BD Alaris System (inferred)','EHR: verify (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Independent; ~20 mi from Ashland — local target. Beds approx. INFERRED; unconfirmed. Verify. EHR INFERRED/UNKNOWN: community hospitals commonly Meditech or Epic; verify.'},
  {name:'Milford Regional Medical Center',state:'MA',city:'Milford',system:'Independent',type:'Community',beds:145,vendors:['BD Alaris System (inferred)','EHR: verify (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Independent; VERY close to Ashland — strong local target. Beds approx. INFERRED; unconfirmed. Verify. EHR INFERRED/UNKNOWN: community hospitals commonly Meditech or Epic; verify.'},
  {name:'Cape Cod Hospital',state:'MA',city:'Hyannis',system:'Cape Cod Healthcare',type:'Community',beds:260,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Cape Cod Healthcare flagship. Beds approx. INFERRED; unconfirmed. Verify. EHR INFERRED: verify (Meditech historically, Epic reported).'},
  {name:'Berkshire Medical Center',state:'MA',city:'Pittsfield',system:'Berkshire Health Systems',type:'Community teaching',beds:300,vendors:['BD Alaris System (inferred)','Meditech EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Western MA independent system. Beds approx. INFERRED; unconfirmed. Verify. EHR INFERRED: Berkshire historically Meditech; verify.'},
  {name:'Winchester Hospital',state:'MA',city:'Winchester',system:'Beth Israel Lahey Health',type:'Community',beds:230,vendors:['BD Alaris System (inferred)','Epic EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'BILH community site. Beds approx. INFERRED; unconfirmed. Verify. EHR CONFIRMED: BILH unified Epic go-live June 2024 (prior: Lahey signed Epic 2013).'},
  {name:'Beverly Hospital',state:'MA',city:'Beverly',system:'Beth Israel Lahey Health',type:'Community',beds:200,vendors:['BD Alaris System (inferred)','Epic EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'BILH North Shore. Beds approx. INFERRED; unconfirmed. Verify. EHR CONFIRMED: BILH unified Epic go-live June 2024 (prior: Lahey signed Epic 2013).'},
  {name:'Signature Healthcare Brockton Hospital',state:'MA',city:'Brockton',system:'Independent',type:'Community',beds:200,vendors:['BD Alaris System (inferred)','EHR: verify (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Independent community. Beds approx. INFERRED; unconfirmed. Verify. EHR INFERRED/UNKNOWN: community hospitals commonly Meditech or Epic; verify.'},
  {name:'Charlton Memorial Hospital',state:'MA',city:'Fall River',system:'Southcoast Health',type:'Community',beds:330,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Southcoast Health. Beds approx. INFERRED; may follow Southcoast standard. Verify. EHR INFERRED (high): Southcoast reported on Epic; verify.'},
  {name:'St. Luke’s Hospital (New Bedford)',state:'MA',city:'New Bedford',system:'Southcoast Health',type:'Community',beds:300,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Southcoast Health. Beds approx. INFERRED; may follow Southcoast standard. Verify. EHR INFERRED (high): Southcoast reported on Epic; verify.'},
  {name:'UMass Memorial HealthAlliance-Clinton',state:'MA',city:'Leominster',system:'UMass Memorial Health',type:'Community',beds:120,vendors:['BD Alaris System (inferred)','Epic EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'UMass Memorial community site. Beds approx. INFERRED; likely follows UMass standard. Verify. EHR CONFIRMED: UMass Memorial Epic go-live Oct 2017 ($700M program).'},
  {name:'Boston Medical Center — Brighton (fmr St. Elizabeth’s)',state:'MA',city:'Brighton',system:'Boston Medical Center',type:'Community teaching',beds:250,vendors:['BD Alaris System (inferred)','Epic EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Former Steward St. Elizabeth’s; now BMC Health System (2024). Beds approx. Integration ongoing — GOOD security-services timing. INFERRED; verify. EHR CONFIRMED: BMC Epic ("eMERGE") go-live 2015; former-Steward sites integrating onto it.'},
  {name:'Boston Medical Center — South (fmr Good Samaritan)',state:'MA',city:'Brockton',system:'Boston Medical Center',type:'Community teaching',beds:200,vendors:['BD Alaris System (inferred)','Epic EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Former Steward Good Samaritan; now BMC Health System (2024). Beds approx. Post-acquisition integration — GOOD timing. INFERRED; verify. EHR CONFIRMED: BMC Epic ("eMERGE") go-live 2015; former-Steward sites integrating onto it.'},
  {name:'MelroseWakefield Hospital',state:'MA',city:'Melrose',system:'Tufts Medicine',type:'Community',beds:230,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Tufts Medicine community site. Beds approx. INFERRED; may follow Tufts standard. Verify. EHR INFERRED (high): Tufts Medicine reported Epic go-live 2022; verify.'},
  {name:'Dartmouth Hitchcock Medical Center',state:'NH',city:'Lebanon',system:'Dartmouth Health',type:'Academic medical center',beds:507,vendors:['Continuous glucose monitor — endo clinic (confirmed-fleet)','BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'NH’s only academic med center; Level 1 trauma. CONFIRMED: CGM used in endocrinology clinic (NCT04944264, NCT05845827). LVP fleet INFERRED. Dartmouth Health flagship — sets system standard. Verify. EHR INFERRED (high): Dartmouth-Hitchcock long-standing Epic site; verify.'},
  {name:'Elliot Hospital',state:'NH',city:'Manchester',system:'SolutionHealth',type:'Community',beds:296,vendors:['BD Alaris System (inferred)','Oracle Cerner EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'SolutionHealth (Elliot + Southern NH). Level 2 trauma. Beds approx. INFERRED; unconfirmed. Verify. EHR INFERRED: Elliot historically Cerner; verify.'},
  {name:'Catholic Medical Center',state:'NH',city:'Manchester',system:'HCA Healthcare',type:'Community',beds:330,vendors:['BD Alaris System (inferred, HCA standard)','Meditech EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'HCA-owned — HCA standardizes fleets system-wide (HealthTrust GPO), historically BD Alaris-heavy; slightly higher-confidence inference but still verify. NE Heart & Vascular Institute. Beds approx. EHR INFERRED (high): HCA standardizes on Meditech system-wide; verify.'},
  {name:'Concord Hospital',state:'NH',city:'Concord',system:'Concord Hospital Health System',type:'Community teaching',beds:295,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Geisel-affiliated teaching; Level 2 trauma. Beds approx. INFERRED; unconfirmed. Verify. EHR INFERRED: verify (Meditech/Epic).'},
  {name:'Southern NH Medical Center',state:'NH',city:'Nashua',system:'SolutionHealth',type:'Community',beds:188,vendors:['BD Alaris System (inferred)','Oracle Cerner EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'SolutionHealth (w/ Elliot). Beds approx. INFERRED; may follow SolutionHealth standard. Verify. EHR INFERRED: Elliot historically Cerner; verify.'},
  {name:'Portsmouth Regional Hospital',state:'NH',city:'Portsmouth',system:'HCA Healthcare',type:'Community',beds:200,vendors:['BD Alaris System (inferred, HCA standard)','Meditech EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'HCA-owned — system-wide fleet standardization (HealthTrust). Beds approx. Slightly higher-confidence inference; verify. EHR INFERRED (high): HCA standardizes on Meditech system-wide; verify.'},
  {name:'Wentworth-Douglass Hospital',state:'NH',city:'Dover',system:'Mass General Brigham',type:'Community',beds:178,vendors:['BD Alaris System (inferred)','Epic EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'MGB member in NH. Beds approx. INFERRED; may follow MGB standard. Verify. EHR CONFIRMED: MGB system-wide Epic (Brigham/Faulkner Epic Beaker; MGB on Epic since ~2016).'},
  {name:'Exeter Hospital',state:'NH',city:'Exeter',system:'Beth Israel Lahey Health',type:'Community',beds:100,vendors:['BD Alaris System (inferred)','Epic EHR (confirmed-fleet)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'BILH member in NH. Beds approx. INFERRED; may follow BILH standard. Verify. EHR CONFIRMED: BILH unified Epic go-live June 2024 (prior: Lahey signed Epic 2013).'},
  {name:'Cheshire Medical Center',state:'NH',city:'Keene',system:'Dartmouth Health',type:'Community',beds:169,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Dartmouth Health member. Beds approx. INFERRED; may follow Dartmouth standard. Verify. EHR INFERRED (high): Dartmouth-Hitchcock long-standing Epic site; verify.'},
  {name:'Frisbie Memorial Hospital',state:'NH',city:'Rochester',system:'HCA Healthcare',type:'Community',beds:110,vendors:['BD Alaris System (inferred, HCA standard)','Meditech EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'HCA-owned — HealthTrust GPO standardization. Beds approx. Slightly higher-confidence inference; verify. EHR INFERRED (high): HCA standardizes on Meditech system-wide; verify.'},
  {name:'St. Joseph Hospital (Nashua)',state:'NH',city:'Nashua',system:'Covenant Health',type:'Community',beds:200,vendors:['BD Alaris System (inferred)','Meditech EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Covenant Health. Beds approx. INFERRED; unconfirmed. Verify. EHR INFERRED: verify.'},
  {name:'Rhode Island Hospital',state:'RI',city:'Providence',system:'Brown University Health',type:'Academic medical center',beds:719,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'RI’s largest; only Level 1 trauma in SE New England. Brown University Health (fmr Lifespan) flagship — sets system standard. Active ventilation device research (Sotair, NCT06117683). LVP fleet INFERRED. Verify. EHR INFERRED (high): Lifespan/Brown University Health on Epic; verify.'},
  {name:'The Miriam Hospital',state:'RI',city:'Providence',system:'Brown University Health',type:'Community teaching',beds:247,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Brown University Health teaching hospital. Beds approx. INFERRED; likely follows Brown system standard. Verify. EHR INFERRED (high): Lifespan/Brown University Health on Epic; verify.'},
  {name:'Hasbro Children’s Hospital',state:'RI',city:'Providence',system:'Brown University Health',type:'Pediatric',beds:87,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Pediatric division of Rhode Island Hospital; Brown University Health. Beds approx. INFERRED; verify (pediatric fleets often differ). EHR INFERRED (high): Lifespan/Brown University Health on Epic; verify.'},
  {name:'Newport Hospital',state:'RI',city:'Newport',system:'Brown University Health',type:'Community',beds:129,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Brown University Health community hospital. Beds approx. INFERRED; likely follows Brown standard. Verify. EHR INFERRED (high): Lifespan/Brown University Health on Epic; verify.'},
  {name:'Women & Infants Hospital',state:'RI',city:'Providence',system:'Care New England',type:'Specialty',beds:247,vendors:['Abbott FreeStyle Libre 3 CGM (confirmed-research)','BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Care New England; leading women/newborn specialty hospital. CONFIRMED-RESEARCH: Abbott FreeStyle Libre 3 Pro CGM + cerebral NIRS in neonatal study (NCT07133906). LVP fleet INFERRED. Verify. EHR INFERRED: Care New England on Epic; verify.'},
  {name:'Kent Hospital',state:'RI',city:'Warwick',system:'Care New England',type:'Community',beds:359,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Care New England community hospital. Beds approx. INFERRED; may follow CNE standard. Verify. EHR INFERRED: Care New England on Epic; verify.'},
  {name:'Roger Williams Medical Center',state:'RI',city:'Providence',system:'CharterCARE Health Partners',type:'Community',beds:200,vendors:['BD Alaris System (inferred)','Meditech EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'CharterCARE (Prospect Medical). Beds approx. INFERRED; unconfirmed. Verify. EHR INFERRED: Prospect/CharterCARE, verify.'},
  {name:'Our Lady of Fatima Hospital',state:'RI',city:'North Providence',system:'CharterCARE Health Partners',type:'Community',beds:200,vendors:['BD Alaris System (inferred)','Meditech EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'CharterCARE (Prospect Medical). Beds approx. INFERRED; unconfirmed. Verify. EHR INFERRED: Prospect/CharterCARE, verify.'},
  {name:'South County Hospital',state:'RI',city:'Wakefield',system:'South County Health',type:'Community',beds:100,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Independent (South County Health). Beds approx. INFERRED; unconfirmed. Verify. EHR INFERRED: verify.'},
  {name:'Landmark Medical Center',state:'RI',city:'Woonsocket',system:'Prime Healthcare',type:'Community',beds:214,vendors:['BD Alaris System (inferred)','Meditech EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Prime Healthcare. Beds approx. INFERRED; unconfirmed. Verify. EHR INFERRED: Prime historically Meditech; verify.'},
  {name:'Westerly Hospital',state:'RI',city:'Westerly',system:'Yale New Haven Health',type:'Community',beds:125,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Yale New Haven Health. Beds approx. INFERRED; may follow YNHH standard. Verify. EHR INFERRED (high): Yale New Haven Health on Epic; verify.'},
  {name:'Northwestern Memorial Hospital',state:'IL',city:'Chicago',system:'Northwestern Medicine',type:'Academic medical center',beds:885,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'#1 in Illinois. EHR INFERRED (high): Epic (Upper-Midwest Epic dominance). Devices INFERRED. Verify.'},
  {name:'University of Chicago Medical Center',state:'IL',city:'Chicago',system:'UChicago Medicine',type:'Academic medical center',beds:811,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Level 1 trauma, 1,000+ beds w/ system. EHR/devices INFERRED. Verify.'},
  {name:'Rush University Medical Center',state:'IL',city:'Chicago',system:'Rush',type:'Academic medical center',beds:671,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Tied #1 in IL (US News). EHR/devices INFERRED. Verify.'},
  {name:'Loyola University Medical Center',state:'IL',city:'Maywood',system:'Loyola Medicine (Trinity Health)',type:'Academic medical center',beds:547,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Trinity Health; Trinity is an Epic system. EHR/devices INFERRED. Verify.'},
  {name:'Advocate Christ Medical Center',state:'IL',city:'Oak Lawn',system:'Advocate Health',type:'Academic medical center',beds:802,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Busy Level 1 trauma. Advocate Health (post Advocate Aurora merger). EHR/devices INFERRED. Verify.'},
  {name:'Advocate Lutheran General Hospital',state:'IL',city:'Park Ridge',system:'Advocate Health',type:'Community teaching',beds:638,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Advocate Health. EHR/devices INFERRED. Verify.'},
  {name:'John H. Stroger Jr. Hospital (Cook County)',state:'IL',city:'Chicago',system:'Cook County Health',type:'Academic safety-net',beds:450,vendors:['BD Alaris System (inferred)','Cerner/Oracle EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Public safety-net; Level 1 trauma. EHR INFERRED (Cook County historically Cerner). Devices INFERRED. Verify.'},
  {name:'Ann & Robert H. Lurie Children’s Hospital',state:'IL',city:'Chicago',system:'Independent',type:'Pediatric',beds:364,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Largest IL pediatric provider. DOCUMENTED RANSOMWARE (see Incident). EHR/devices INFERRED (pediatric fleets differ). Verify.'},
  {name:'UI Health (University of Illinois Hospital)',state:'IL',city:'Chicago',system:'University of Illinois',type:'Academic medical center',beds:462,vendors:['BD Alaris System (inferred)','Cerner/Oracle EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Academic. EHR INFERRED. Devices INFERRED. Verify.'},
  {name:'Endeavor Health Evanston Hospital',state:'IL',city:'Evanston',system:'Endeavor Health',type:'Community teaching',beds:354,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Endeavor Health (fmr NorthShore). EHR/devices INFERRED. Verify.'},
  {name:'Advocate Illinois Masonic Medical Center',state:'IL',city:'Chicago',system:'Advocate Health',type:'Community teaching',beds:408,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Advocate Health, North Side. EHR/devices INFERRED. Verify.'},
  {name:'Mayo Clinic Hospital — Rochester (Saint Marys)',state:'MN',city:'Rochester',system:'Mayo Clinic',type:'Academic medical center',beds:1265,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'World-renowned; among largest US hospitals. EHR INFERRED (high): Mayo went all-Epic 2018 (widely reported). Devices INFERRED. Verify.'},
  {name:'M Health Fairview University of Minnesota Medical Center',state:'MN',city:'Minneapolis',system:'M Health Fairview',type:'Academic medical center',beds:908,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Academic hub, transplants. EHR INFERRED (high, Epic). Devices INFERRED. Verify.'},
  {name:'Abbott Northwestern Hospital',state:'MN',city:'Minneapolis',system:'Allina Health',type:'Academic medical center',beds:686,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Allina flagship, #1 Twin Cities. DOCUMENTED BREACHES (see Incident). EHR INFERRED (Allina "Excellian" = Epic). Devices INFERRED. Verify.'},
  {name:'Hennepin Healthcare (HCMC)',state:'MN',city:'Minneapolis',system:'Hennepin Healthcare',type:'Academic safety-net',beds:484,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Public safety-net; Level 1 trauma & pediatric. EHR/devices INFERRED. Verify.'},
  {name:'Regions Hospital',state:'MN',city:'St. Paul',system:'HealthPartners',type:'Academic medical center',beds:454,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'HealthPartners; Level 1 trauma. DOCUMENTED BREACH (see Incident). EHR INFERRED (Epic). Devices INFERRED. Verify.'},
  {name:'United Hospital',state:'MN',city:'St. Paul',system:'Allina Health',type:'Community',beds:471,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Allina Health, St. Paul. EHR/devices INFERRED. Possibly within Allina Blackbaud scope — verify.'},
  {name:'North Memorial Health Hospital',state:'MN',city:'Robbinsdale',system:'North Memorial Health',type:'Community',beds:355,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Independent; Level 1 trauma. EHR/devices INFERRED. Verify.'},
  {name:'Children’s Minnesota',state:'MN',city:'Minneapolis',system:'Children’s Minnesota',type:'Pediatric',beds:381,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Leading MN pediatric system. DOCUMENTED BREACH (see Incident). EHR/devices INFERRED (pediatric). Verify.'},
  {name:'Park Nicollet Methodist Hospital',state:'MN',city:'St. Louis Park',system:'HealthPartners',type:'Community',beds:426,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'HealthPartners (post Park Nicollet merger). EHR/devices INFERRED. Verify.'},
  {name:'St. Cloud Hospital',state:'MN',city:'St. Cloud',system:'CentraCare',type:'Community teaching',beds:489,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'CentraCare flagship. EHR/devices INFERRED. Verify.'},
  {name:'Essentia Health — Duluth (St. Mary’s)',state:'MN',city:'Duluth',system:'Essentia Health',type:'Community teaching',beds:350,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Essentia Health; Epic since 2020. EHR/devices INFERRED. Verify.'},
  {name:'The Johns Hopkins Hospital',state:'MD',city:'Baltimore',system:'Johns Hopkins Medicine',type:'Academic medical center',beds:1162,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Largest in MD; #1 in state. DOCUMENTED BREACH (MOVEit, see Incident). EHR INFERRED (high, Epic since 2013). Devices INFERRED. Verify.'},
  {name:'University of Maryland Medical Center',state:'MD',city:'Baltimore',system:'University of Maryland Medical System',type:'Academic medical center',beds:800,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Shock Trauma; academic. EHR INFERRED (high, Epic). Devices INFERRED. Verify.'},
  {name:'Johns Hopkins Bayview Medical Center',state:'MD',city:'Baltimore',system:'Johns Hopkins Medicine',type:'Academic medical center',beds:420,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'JH Medicine. EHR INFERRED (Epic). Devices INFERRED. Verify.'},
  {name:'MedStar Union Memorial Hospital',state:'MD',city:'Baltimore',system:'MedStar Health',type:'Community teaching',beds:192,vendors:['BD Alaris System (inferred)','Cerner/Oracle EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'MedStar Health. DOCUMENTED (2016 system-wide ransomware, see Incident). EHR INFERRED (MedStar historically Cerner/MedConnect). Devices INFERRED. Verify.'},
  {name:'MedStar Harbor Hospital',state:'MD',city:'Baltimore',system:'MedStar Health',type:'Community',beds:135,vendors:['BD Alaris System (inferred)','Cerner/Oracle EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'MedStar Health. DOCUMENTED (2016 system-wide ransomware, see Incident). EHR INFERRED. Devices INFERRED. Verify.'},
  {name:'Johns Hopkins Suburban Hospital',state:'MD',city:'Bethesda',system:'Johns Hopkins Medicine',type:'Community',beds:228,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'JH Medicine, DC-metro. EHR INFERRED (Epic). Devices INFERRED. Verify.'},
  {name:'University of Maryland St. Joseph Medical Center',state:'MD',city:'Towson',system:'University of Maryland Medical System',type:'Community',beds:218,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'UMMS. EHR INFERRED (Epic). Devices INFERRED. Verify.'},
  {name:'UM Baltimore Washington Medical Center',state:'MD',city:'Glen Burnie',system:'University of Maryland Medical System',type:'Community',beds:300,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'UMMS. EHR INFERRED (Epic). Devices INFERRED. Verify.'},
  {name:'Anne Arundel Medical Center (Luminis)',state:'MD',city:'Annapolis',system:'Luminis Health',type:'Community teaching',beds:380,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Luminis Health. EHR INFERRED (Epic). Devices INFERRED. Verify.'},
  {name:'TidalHealth Peninsula Regional',state:'MD',city:'Salisbury',system:'TidalHealth',type:'Community',beds:288,vendors:['BD Alaris System (inferred)','Cerner/Oracle EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Eastern Shore. EHR/devices INFERRED. Verify.'},
  {name:'Meritus Medical Center',state:'MD',city:'Hagerstown',system:'Meritus Health',type:'Community',beds:267,vendors:['BD Alaris System (inferred)','Epic EHR (inferred)','Patient monitors: Philips/GE (inferred)','Ventilators: Medtronic/Dräger (inferred)'],contact:'',title:'',email:'',status:'Not started',notes:'Western MD independent. EHR/devices INFERRED. Verify.'},
];

const SOURCES=[
  ['Becker\u2019s Hospital Review','Largest US hospitals by beds (annual, Feb 2026).','https://www.beckershospitalreview.com/rankings-and-ratings/100-of-the-largest-hospitals-and-health-systems-in-the-us-2026/'],
  ['Definitive Healthcare','Top MA hospitals by staffed beds; largest MA IDNs by NPR.','https://www.definitivehc.com/resources/healthcare-insights/top-hospitals-massachusetts-number-beds'],
  ['Mass General Brigham','Member hospitals and affiliations.','https://www.massgeneralbrigham.org/en/about/members-affiliations'],
  ['ClinicalTrials.gov (device confirmations)','Named device-in-use evidence: MGH NCT02969863; BMC Dräger NCT00606554; BIDMC NCT03715751; BCH Medtronic 670G NCT04051632; Dartmouth-Hitchcock CGM NCT04944264; Women & Infants Abbott Libre CGM NCT07133906; RI Hospital ventilation research NCT06117683.','https://clinicaltrials.gov/'],
  ['J Infusion Nursing / PMC (Giuliano et al.)','US LVP smart-pump market share (BD Alaris >50%, Baxter Spectrum ~22-30%, ICU Plum ~16%, B.Braun ~5%) — basis for inference.','https://pmc.ncbi.nlm.nih.gov/articles/PMC9422768/'],
  ['Mass.gov / WBUR (Steward transition)','Current owners of former-Steward MA hospitals (2024): St. Elizabeth\u2019s & Good Samaritan → BMC; Morton & St. Anne\u2019s → Brown University Health.','https://www.mass.gov/info-details/steward-health-care-transition-to-the-new-operators'],
  ['NH Hospital Assoc. / Wikipedia','NH systems & beds: Dartmouth Health (DHMC 507), Elliot/SolutionHealth, HCA (Catholic Medical, Portsmouth, Frisbie), Concord, MGB (Wentworth-Douglass), BILH (Exeter).','https://en.wikipedia.org/wiki/List_of_hospitals_in_New_Hampshire'],
  ['Brown University Health','RI systems & beds: Brown University Health (fmr Lifespan; RI Hospital 719, Miriam, Hasbro, Newport), Care New England (Women & Infants, Kent), CharterCARE.','https://www.brownhealth.org/about-brown-university-health/overview'],
  ['Becker\u2019s / Healthcare IT News / HCI (EHR go-lives)','EHR confirmations: MGB Epic; BILH Epic (June 2024); UMass Memorial Epic (2017); BMC Epic (2015); Boston Children\u2019s Epic (2024, from Cerner); Baystate on Oracle Cerner. Epic ~60% of academic-medical-center market (KLAS).','https://www.beckershospitalreview.com/ehrs/how-epic-won-over-academic-medical-centers/'],
  ['CISA ICS Medical Advisories / NVD','Device CVEs, CVSS, remediation: GE CARESCAPE MDhex ICSMA-20-023-01 (5× CVSS 10.0); Baxter ICSMA-20-170-04 (8.6); BD Alaris ICSMA-23-194-01 (8.2)/URGENT-11; B.Braun ICSMA-21-294-01; Philips ICSMA-20-254-01 (8.2).','https://www.cisa.gov/news-events/ics-medical-advisories'],
  ['HHS OCR breach portal + news','Documented incidents: UMass Memorial phishing breach (209,048; $1.2M settlement); Signature Healthcare Brockton Inc Ransom ransomware. Systematic per-hospital source.','https://ocrportal.hhs.gov/ocr/breach/breach_report.jsf'],
  ['FDA 510(k) records (product code FRN)','Real infusion-pump products/vendors — the autocomplete device library.','https://fda.report/Product-Code/FRN'],
  ['CHIA (MA) / state agencies','Official hospital data (verify approximate bed counts here).','https://www.chiamass.gov/'],
];

// ---- device CVE library: real CISA ICS Medical Advisories / NVD. maxCvss = worst known.
//      'match' is matched against a hospital's device tag text. Remediation status noted, but
//      whether a GIVEN hospital has patched is unknown — exposure is "potential, verify". ----
const CVEDB=[
  {match:['BD Alaris'],device:'BD Alaris System (Guardrails MX / PCU / Plus)',mitig:'Segment pumps to a dedicated VLAN with ACLs; confirm the ENEA/IPnet (URGENT/11) OS is patched or the pump is network-isolated; restrict Guardrails server access and use certificate-based auth; disable unused services; monitor pump-network east-west traffic.',rem:'likely-remediated',remNote:'Firmware fix since Jul 2021 (Alaris 12.3 / PCU 12.1.2). Most maintained sites patched; residual only where legacy OS / URGENT-11 IPnet stack left unpatched.',xlevel:'med',netFacing:true,advisory:'ICSMA-23-194-01 (2023); ICSMA-18-235-01; URGENT/11',maxCvss:9.4,
   keyCves:'CVE-2023-30563 (8.2, XSS/session hijack); CVE-2018-14786 (9.4, Alaris Plus missing auth); URGENT/11 CVE-2019-12255/12264 (IPnet TCP/IP stack)',
   exploit:'Low attack complexity; no known active exploitation; several network-reachable',
   remediation:'Patched in Alaris System 12.3 / PCU 12.1.2 (Jul 2021). Exposure depends on whether the site has updated.',status:'Fix available',
   url:'https://www.cisa.gov/news-events/ics-medical-advisories/icsma-23-194-01'},
  {match:['Baxter Spectrum','Baxter Sigma','Baxter SIGMA'],device:'Baxter Sigma/Spectrum Infusion (Wireless Battery Module)',mitig:'Disable Telnet/FTP on the Wireless Battery Module; place pumps on a dedicated VLAN; replace default/hard-coded credentials where possible; run pumps offline (no Wi-Fi) for critical care; alert on cleartext auth on the segment.',rem:'likely-remediated',remNote:'Fixes + Telnet/FTP disable available 2020-2022 (4-5 yrs). Likely remediated where WBM firmware is current; residual on old WBM versions.',xlevel:'med',netFacing:true,advisory:'ICSMA-20-170-04 (2020); ICSMA-22-251-01 (2022)',maxCvss:8.6,
   keyCves:'CVE-2020-12045 / CVE-2020-12041 (8.6, Telnet/FTP cleartext + hard-coded creds); CVE-2022-26394 (7.5, MITM)',
   exploit:'Some remote (high complexity); PHI exposure, man-in-the-middle, denial of service',
   remediation:'Updates disable Telnet/FTP; isolate to a dedicated VLAN; pump can run without network.',status:'Fix + compensating controls',
   url:'https://www.cisa.gov/news-events/ics-medical-advisories/icsma-20-170-04'},
  {match:['B. Braun','B.Braun','Braun Infusomat','Braun Perfusor'],device:'B. Braun Infusomat/Perfusor Space (SpaceCom)',mitig:'Restrict the SpaceCom web interface to a management VLAN; disable remote configuration; segment the pump network; alert on any medication-parameter/dose change; enforce strong SpaceCom credentials.',rem:'likely-remediated',remNote:'SpaceCom2 update available since 2021. Likely remediated at maintained sites.',xlevel:'medhigh',netFacing:true,advisory:'ICSMA-21-294-01 (2021)',maxCvss:8.0,
   keyCves:'CVE-2021-33882/33883/33884/33885/33886 — chainable to alter a running medication dose',
   exploit:'Same-network; chainable to dose manipulation (direct patient-safety impact)',
   remediation:'SpaceCom2 software 012U000093 + battery-pack firmware updates.',status:'Fix available',
   url:'https://www.cisa.gov/news-events/ics-medical-advisories/icsma-21-294-01'},
  {match:['GE'],device:'GE CARESCAPE Monitors / CIC Pro / ApexPro ("MDhex")',mitig:'Fully isolate the MC/IX monitoring network on a dedicated VLAN; block SMB (TCP 139/445) and unneeded UDP at the segment boundary; disable/restrict device-discovery services; physically secure monitor and central-station bays; deploy east-west IDS on the clinical segment; use MAC/port security so exploitation requires physical access.',rem:'residual',remNote:'The "fix" is network-isolation CONFIG, not a simple patch — commonly incomplete in the field. If the MC/IX monitoring network is not fully segmented, the CVSS-10 exposure remains ACTIVE. Highest residual risk here.',xlevel:'high',netFacing:true,advisory:'ICSMA-20-023-01 (2020)',maxCvss:10.0,
   keyCves:'CVE-2020-6961/6962/6963/6964/6966 (5× CVSS 10.0 — remote code execution, hard-coded SMB creds); CVE-2020-6965 (8.5)',
   exploit:'HIGH — network-exploitable, "easily exploitable"; RCE, silence/alter alarms, steal PHI, render unusable',
   remediation:'Network isolation per GE CARESCAPE config guides; some fixes require physical servicing. A properly isolated MC/IX network forces physical access.',status:'Config / compensating controls — highest priority',
   url:'https://www.cisa.gov/news-events/ics-medical-advisories/icsma-20-023-01'},
  {match:['Philips'],device:'Philips IntelliVue Patient Monitors (MX/X2/X3) / PIC iX',mitig:'Isolate the patient-monitoring subnet per Philips "Security for Clinical Networks"; restrict management access; apply available patches; enforce certificate validation; physically secure bedside modules.',rem:'partial',remNote:'Vendor patches + isolation; vector is mostly adjacent-network/physical. Residual where patches/isolation incomplete.',xlevel:'low',netFacing:true,advisory:'ICSMA-20-254-01 (2020); ICSMA-18-156-01',maxCvss:8.2,
   keyCves:'CVE-2018-10601 (8.2); CVE-2020-16212 (6.8); certificate-revocation & input-validation flaws',
   exploit:'Mostly adjacent-network / physical; PHI access, DoS via restart',
   remediation:'Philips patches + network isolation per "Security for Clinical Networks" guide.',status:'Fix + compensating controls',
   url:'https://www.cisa.gov/news-events/ics-medical-advisories/icsma-20-254-01'},
  {match:['Ventilator','Dräger vent'],device:'Ventilators (Dräger / Medtronic)',mitig:'Verify current CISA advisories and firmware per model; segment biomed devices onto a controlled VLAN; restrict management interfaces to a jump host; monitor for configuration changes.',rem:'verify',remNote:'Not enumerated in this pass — verify per model/firmware.',xlevel:'unknown',netFacing:true,advisory:'Multiple CISA advisories exist (not enumerated in this pass)',maxCvss:null,
   keyCves:'Vendor-specific advisories published; not catalogued here yet',
   exploit:'Varies — verify against CISA per model',
   remediation:'Verify current advisories and firmware per model.',status:'Verify',
   url:'https://www.cisa.gov/news-events/cybersecurity-advisories?f%5B0%5D=advisory_type%3A95'},
];
// EHR (Epic/Cerner/Meditech), CGM, bionic pancreas, esophageal catheter: not in ICSMA device-CVE
// scope the same way — EHR risk is infrastructure/credential, tracked separately. Not scored here.

// ---- documented public security incidents (HHS OCR breach portal + reputable news). Cited.
//      Absence here = no incident found in this pass, NOT proof of none. Verify via HHS OCR portal. ----
const INCIDENTS={
  'The Johns Hopkins Hospital':{sev:'confirmed',text:'MOVEit / Clop breach (2023) — Russian-linked Clop gang exploited a zero-day in the MOVEit file-transfer tool (CVE-2023-34362); patient/employee data compromised. JH described as a "minor player" in a global breach of 670+ organizations. Cause: third-party software zero-day.',src:'Becker\u2019s / The Baltimore Banner'},
  'MedStar Union Memorial Hospital':{sev:'confirmed',text:'2016 MedStar Health system-wide ransomware — 10 hospitals + 250 outpatient sites paralyzed for days; care delayed, providers forced to paper charting; reportedly exploited a KNOWN, unpatched software vulnerability (Samsam/JBoss). One of the largest hospital ransomware events of its era. Cause: ransomware via unpatched server software.',src:'CBS Baltimore / KrebsOnSecurity'},
  'MedStar Harbor Hospital':{sev:'confirmed',text:'Affected by the 2016 MedStar Health system-wide ransomware attack (10 hospitals). Cause: ransomware via unpatched server software.',src:'CBS Baltimore'},

  'Ann & Robert H. Lurie Children\u2019s Hospital':{sev:'confirmed',text:'Rhysida ransomware, detected Jan 31 2024; EHR, phones & MyChart offline ~1 month; ~600GB exfiltrated; ~775,860 individuals (HHS portal) / 791,784 (Maine AG); \$3.4M ransom demanded and NOT paid; data later sold on dark web. Cause: ransomware (Rhysida, double-extortion).',src:'Comparitech / HIPAA Journal / HHS OCR portal'},
  'Abbott Northwestern Hospital':{sev:'confirmed',text:'Allina Health affected by Blackbaud third-party ransomware (2020) — ~200,000 patients/donors; separately Allina\u2019s Apple Valley Clinic hit via vendor Netgain ransomware (2021, 157,939). Cause: third-party/vendor ransomware.',src:'Star Tribune / Becker\u2019s / Infosecurity'},
  'Children\u2019s Minnesota':{sev:'confirmed',text:'Blackbaud third-party ransomware breach (2020) — ~160,000 patients/donors (foundation database). Cause: third-party vendor ransomware.',src:'Star Tribune / Fox9'},
  'Regions Hospital':{sev:'confirmed',text:'Blackbaud third-party ransomware breach (2020) — 52,795 patients (foundation database). Cause: third-party vendor ransomware.',src:'Bring Me The News / Star Tribune'},

  'UMass Memorial Medical Center':{sev:'confirmed',text:'Email phishing breach Jun 2020–Jan 2021; compromised staff email accounts exposed SSNs, driver\u2019s licenses, financial & clinical data. Reported to HHS OCR as 209,048 individuals; $1.2M class-action settlement. Cause: phishing → account compromise (no MFA at the time).',src:'Newsweek / HIPAA Journal / Mass OCABR'},
  'UMass Memorial — Marlborough':{sev:'confirmed',text:'Part of UMass Memorial Health, affected by the same 2020–2021 email phishing breach (system-wide). Verify site-specific scope.',src:'UMass Memorial Health notice'},
  'UMass Memorial HealthAlliance-Clinton':{sev:'confirmed',text:'Part of UMass Memorial Health; within scope of the 2020–2021 system-wide email phishing breach. Verify site-specific scope.',src:'UMass Memorial Health notice'},
  'Signature Healthcare Brockton Hospital':{sev:'confirmed',text:'Inc Ransom ransomware attack; services cancelled, ambulances diverted, pharmacy disruption. Took ~1 year to publicly disclose the data breach. Cause: ransomware (Inc Ransom group); initial vector not publicly confirmed.',src:'SecurityWeek (2026)'},
};

let data=load();
let sort=loadSort()||{col:'risk',dir:-1};
let vsort={col:'n',dir:-1};

function load(){try{const d=JSON.parse(localStorage.getItem(KEY));return d&&d.length?d:seed()}catch(e){return seed()}}
function seed(){return JSON.parse(JSON.stringify(SEED))}
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function loadSort(){try{return JSON.parse(localStorage.getItem(SORTKEY))}catch(e){return null}}
function saveSort(){localStorage.setItem(SORTKEY,JSON.stringify(sort))}
function resetSeed(){if(confirm('Reset the hospital list to the built-in MA seed? Your added hospitals and device tags will be lost.')){data=seed();save();renderHosp()}}

function switchTab(t){
  document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===t));
  ['hospitals','vendors','vulns','incidents','summary'].forEach(x=>document.getElementById('tab-'+x).classList.toggle('hide',x!==t));
  if(t==='vendors')renderVend();if(t==='summary')renderSummary();
  if(t==='vulns')renderVulns();if(t==='incidents')renderIncidents();
}
function renderVulns(){
  const sevColor=c=>c>=9?'v-crit':c>=7?'v-high':c>=0?'v-med':'v-inf';
  const remChip=r=>{const m={'likely-remediated':['v-cfleet','likely remediated'],'partial':['v-med','partially remediated'],'residual':['v-crit','residual / active'],'verify':['v-inf','verify']}[r]||['v-def',r||'—'];return `<span class="tag ${m[0]}">${m[1]}</span>`;};
  document.getElementById('vulntable').innerHTML=
    '<tr><th>Device</th><th>Max CVSS</th><th>Likely status now</th><th>Key CVEs</th><th>Mitigations if NOT remediated</th><th>Advisory</th></tr>'+
    CVEDB.map(c=>`<tr>
      <td><b>${esc(c.device)}</b></td>
      <td><span class="tag ${c.maxCvss!=null?sevColor(c.maxCvss):'v-inf'}">${c.maxCvss!=null?c.maxCvss.toFixed(1):'n/a'}</span></td>
      <td>${remChip(c.rem)}<br><span class="mut" style="font-size:11px">${esc(c.remNote||'')}</span></td>
      <td style="font-size:12px">${esc(c.keyCves)}</td>
      <td style="font-size:12px">${c.mitig?esc(c.mitig):'<span class="mut">verify per model</span>'}</td>
      <td style="font-size:12px"><a href="${c.url}" target="_blank" rel="noopener">${esc(c.advisory)}</a></td>
    </tr>`).join('')+
    '<tr><td colspan="6" style="font-size:12px;color:var(--mut);padding:12px"><b>How to read "Likely status now":</b> these advisories are 2&ndash;6 years old with vendor fixes published. Where the fix is firmware (pumps), maintained sites have most likely remediated &mdash; so it is <b>not an active risk</b> unless firmware is stale. Where the "fix" is network-isolation config (GE MDhex), it is <b>commonly incomplete</b>, so the CVSS-10 exposure is treated as <b>residual/active</b>. The <b>Mitigations</b> column gives the compensating controls to apply where the vulnerability is not (or cannot be) patched. The Risk score discounts likely-remediated CVEs accordingly.</td></tr>';
}
function renderIncidents(){
  const rows=Object.entries(INCIDENTS);
  document.getElementById('inctable').innerHTML=
    '<tr><th>Hospital</th><th>Documented incident — cause</th><th>Source</th></tr>'+
    rows.map(([name,inc])=>`<tr>
      <td><b>${esc(name)}</b></td>
      <td style="font-size:12px">${esc(inc.text)}</td>
      <td style="font-size:12px">${esc(inc.src)}</td>
    </tr>`).join('')+
    `<tr><td colspan="3" style="color:var(--mut);font-size:12px;padding:12px">Other ${data.length-rows.length} hospitals: no public incident found in this pass. Verify each via the HHS OCR breach portal (ocrportal.hhs.gov/ocr/breach).</td></tr>`;
}

// ---------- hospitals table ----------
const HCOLS=[
  ['name','Hospital','txt'],['state','St','txt'],['city','City','txt'],['system','System','sys'],
  ['type','Type','txt'],['beds','Beds','num'],['vendors','Devices / vendors','tags'],
  ['risk','Risk','risk'],['exposure','CVE exposure','exp'],['incident','Incident','inc'],
  ['ciso','CISO / security leader','edit'],['notes','Notes','edit']
];
function sysPill(s){const m={'Mass General Brigham':'p-mgb','Beth Israel Lahey Health':'p-bilh',
  'UMass Memorial Health':'p-umass','Tufts Medicine':'p-tufts','Independent':'p-ind'};
  return `<span class="pill ${m[s]||'p-other'}">${esc(s)}</span>`}
function statusPill(s){const c=s==='Won'?'st-won':(['Contacted','Meeting set','Researching'].includes(s)?'st-active':'st-none');
  return `<span class="status ${c}">${esc(s||'Not started')}</span>`}

function renderTopSummary(){
  const el=document.getElementById('topsummary'); if(!el)return;
  const byState=s=>data.filter(h=>h.state===s).length;
  let crit=0,high=0,inc=0;
  data.forEach(h=>{const r=risk(h); if(r.band==='critical')crit++; if(r.band==='high')high++; if(INCIDENTS[h.name])inc++;});
  el.className='topstats';
  const st=(v,l,cls)=>`<div class="st ${cls||''}"><span class="v">${v}</span><span class="l">${l}</span></div>`;
  el.innerHTML=
    st(data.length,'Hospitals')+
    st(`${byState('MA')}·${byState('NH')}·${byState('RI')}·${byState('IL')}·${byState('MN')}·${byState('MD')}`,'MA·NH·RI·IL·MN·MD')+
    st(crit,'Critical','crit')+
    st(high,'High','warn')+
    st(inc,'Documented incidents','warn');
}
function renderHosp(){
  renderTopSummary();
  const head=document.getElementById('hhead');
  head.innerHTML=HCOLS.map(c=>`<th onclick="setSort('${c[0]}')">${c[1]}${sort.col===c[0]?`<span class="arr">${sort.dir<0?'\u25bc':'\u25b2'}</span>`:''}</th>`).join('');
  const q=document.getElementById('search').value.toLowerCase();
  const fsys=document.getElementById('fsystem').value, fst=document.getElementById('fstatus').value;
  const fstate=document.getElementById('fstate').value;
  let rows=data.map((d,i)=>({d,i}));
  if(q)rows=rows.filter(({d})=>[d.name,d.city,d.system,d.type,(d.vendors||[]).join(' '),d.contact].join(' ').toLowerCase().includes(q));
  if(fstate)rows=rows.filter(({d})=>d.state===fstate);
  if(fsys)rows=rows.filter(({d})=>d.system===fsys);
  if(fst)rows=rows.filter(({d})=>(d.status||'Not started')===fst);
  rows.sort((a,b)=>{let x=a.d[sort.col],y=b.d[sort.col];
    if(sort.col==='vendors'){x=(x||[]).length;y=(y||[]).length}
    if(sort.col==='beds'){x=+x||0;y=+y||0}
    if(sort.col==='risk'){x=risk(a.d).score;y=risk(b.d).score}
    if(sort.col==='exposure'){x=exposure(a.d).maxC||-1;y=exposure(b.d).maxC||-1}
    if(sort.col==='incident'){x=INCIDENTS[a.d.name]?1:0;y=INCIDENTS[b.d.name]?1:0}
    if(typeof x==='string'){x=x.toLowerCase();y=(y||'').toLowerCase()}
    return x<y?-1*sort.dir:x>y?1*sort.dir:0});
  const body=document.getElementById('hbody');
  body.innerHTML=rows.map(({d,i})=>`<tr>
    <td><a class="hlink" onclick="openDetail(${i})">${esc(d.name)}</a></td>
    <td>${esc(d.state||'')}</td>
    <td>${esc(d.city)}</td>
    <td>${sysPill(d.system)}</td>
    <td>${esc(d.type)}</td>
    <td class="num">${d.beds?(+d.beds).toLocaleString():''}</td>
    <td class="edit">${tagCell(i)}</td>
    <td>${riskCell(d)}</td>
    <td>${expCell(d)}</td>
    <td>${incCell(d)}</td>
    <td class="edit"><input value="${esc(d.ciso)}" placeholder="add CISO / security leader" onchange="upd(${i},'ciso',this.value)"></td>
    <td class="edit"><textarea rows="1" onchange="upd(${i},'notes',this.value)">${esc(d.notes)}</textarea></td>
  </tr>`).join('');
  document.getElementById('hcount').textContent=`${rows.length} shown / ${data.length} total`;
  const sel=document.getElementById('fsystem');const keep=sel.value;
  const systems=[...new Set(data.map(d=>d.system))].sort();
  sel.innerHTML='<option value="">All systems</option>'+systems.map(s=>`<option${s===keep?' selected':''}>${esc(s)}</option>`).join('');
}
function vclass(v){
  if(/confirmed-fleet/.test(v))return 'v-cfleet';
  if(/confirmed-research/.test(v))return 'v-cres';
  if(/low confidence/.test(v))return 'v-low';
  if(/inferred/.test(v))return 'v-inf';
  return 'v-def';
}
// compute a hospital's CVE exposure from its device tags. Inherits confidence:
// if the matching device tag is inferred, exposure is inferred.
function exposure(h){
  let maxC=-1, hits=[], anyConfirmed=false, anyInferred=false, worst=null;
  (h.vendors||[]).forEach(v=>{
    CVEDB.forEach(c=>{
      if(c.match.some(m=>v.indexOf(m)>=0)){
        const conf = /confirmed/.test(v);
        hits.push({dev:c.device,cvss:c.maxCvss,conf});
        if(conf)anyConfirmed=true; else anyInferred=true;
        if(c.maxCvss!=null && c.maxCvss>maxC){maxC=c.maxCvss; worst=c;}
      }
    });
  });
  if(!hits.length)return {level:'none',label:'—',cls:'v-def',maxC:null,worst:null,conf:''};
  const conf = anyConfirmed && !anyInferred ? 'confirmed' : (anyConfirmed?'mixed':'inferred');
  let cls, level;
  if(maxC>=9){cls='v-crit';level='critical';}
  else if(maxC>=7){cls='v-high';level='high';}
  else if(maxC>=0){cls='v-med';level='medium';}
  else {cls='v-inf';level='unscored';}
  // dim toward amber if inferred
  const label = (maxC>=0?('up to '+maxC.toFixed(1)):'unscored')+(worst?' · '+worst.device.split(' (')[0].replace(/ Monitors.*| System.*| Infusion.*/,''):'')+' ('+conf+')';
  return {level,label,cls,maxC,worst,conf,hits};
}
// ---- composite RISK model (transparent, 0-100). Rationale in the footer.
const XPTS={high:25, medhigh:20, med:15, low:8, unknown:5};
const REMFACTOR={'likely-remediated':0.35,'partial':0.7,'residual':1.0,'verify':0.6};
function risk(h){
  const e=exposure(h);
  if(e.level==='none')return {score:0,band:'none',cls:'v-def',conf:'',why:'No devices with known CVEs tagged.'};
  // find the worst device's remediation factor (residual = full weight)
  let worstRem='verify', worstC=-1;
  (h.vendors||[]).forEach(v=>CVEDB.forEach(c=>{ if(c.match.some(m=>v.indexOf(m)>=0) && c.maxCvss!=null && c.maxCvss>worstC){worstC=c.maxCvss; worstRem=c.rem||'verify';}}));
  const remF = REMFACTOR[worstRem]!=null?REMFACTOR[worstRem]:0.6;
  const sev = (e.maxC>=0 ? (e.maxC/10)*40 : 8) * remF;  // ACTIVE severity discounts likely-remediated
  let xl='unknown', netFacing=false;
  (h.vendors||[]).forEach(v=>CVEDB.forEach(c=>{ if(c.match.some(m=>v.indexOf(m)>=0)){
    if((XPTS[c.xlevel]||0) > (XPTS[xl]||0)) xl=c.xlevel;
    if(c.netFacing) netFacing=true;
  }}));
  const xp = (XPTS[xl]||5) * remF;
  const ext = netFacing?15:0;
  const inc = INCIDENTS[h.name]?10:0;
  const blast = Math.min(10,((+h.beds||0)/1000)*10);
  const score = Math.round(sev+xp+ext+inc+blast);
  const conf = e.conf;
  let band,cls;
  if(score>=70){band='critical';cls='v-crit';}
  else if(score>=50){band='high';cls='v-high';}
  else if(score>=30){band='medium';cls='v-med';}
  else {band='low';cls='v-def';}
  const remLabel={'likely-remediated':'likely remediated','partial':'partially remediated','residual':'residual/active','verify':'unverified'}[worstRem]||worstRem;
  const why=`Active severity ${Math.round(sev)}/40 (max CVSS ${e.maxC>=0?e.maxC.toFixed(1):'n/a'}, worst-device remediation: ${remLabel}, ×${remF}) · Exploitability ${Math.round(xp)}/25 (${xl}) · External-facing ${ext}/15 · Incident ${inc}/10 · Blast radius ${Math.round(blast)}/10 (${h.beds||'?'} beds). Confidence: ${conf}.`;
  return {score,band,cls,conf,why,worstRem};
}
function postureAction(h){
  const tags=(h.vendors||[]).join(' '); const ex=exposure(h); const acts=[];
  if(/GE/.test(tags)&&ex.hits&&ex.hits.some(x=>/MDhex|CARESCAPE/.test(x.dev)))
    acts.push('Isolate patient-monitoring (MC/IX) network per GE CARESCAPE config guide — MDhex is CVSS 10 and network-exploitable.');
  if(/BD Alaris|Baxter|Braun/.test(tags))
    acts.push('Move infusion pumps to a dedicated VLAN; disable Telnet/FTP; confirm firmware current (Alaris 12.3 / Baxter WBM / SpaceCom2).');
  if(/Philips/.test(tags))
    acts.push('Apply Philips patches + network isolation per "Security for Clinical Networks" guide.');
  if(INCIDENTS[h.name]&&/phishing/i.test(INCIDENTS[h.name].text))
    acts.push('Enforce MFA on email/remote access — a prior phishing breach here shows this gap was exploited.');
  if(INCIDENTS[h.name]&&/ransomware/i.test(INCIDENTS[h.name].text))
    acts.push('Harden edge/VPN, segment clinical from IT networks, rehearse ransomware recovery — ransomware is on record here.');
  if(!acts.length)acts.push('Verify fleet, segment clinical devices from the business network, confirm current firmware.');
  return acts;
}
const expandedTags=new Set();
function toggleTags(i){ if(expandedTags.has(i))expandedTags.delete(i); else expandedTags.add(i); renderHosp(); }
function tagCell(i){
  const vs=data[i].vendors||[];
  if(!expandedTags.has(i)){
    const conf=vs.filter(v=>/confirmed/.test(v)).length;
    return `<a class="hlink" style="border:none;font-weight:600" onclick="toggleTags(${i})">${vs.length} devices${conf?' · '+conf+' confirmed':''} \u25be</a>`;
  }
  return `<a class="hlink" style="border:none;font-weight:600" onclick="toggleTags(${i})">${vs.length} devices \u25b4</a><br>`+
    vs.map((v,j)=>`<span class="tag ${vclass(v)}">${esc(v)}<span class="x" onclick="delTag(${i},${j})">\u00d7</span></span>`).join('')+
    `<input class="taginput" list="vendorlib" placeholder="+ add device\u2026" onkeydown="if(event.key==='Enter'){addTag(${i},this.value);this.value=''}">`;
}
function riskCell(d){
  const r=risk(d);
  if(r.band==='none')return '<span style="color:var(--mut)">—</span>';
  const acts=postureAction(d).join(' | ');
  return `<span class="tag ${r.cls}" title="${esc(r.why)}&#10;&#10;Top action: ${esc(acts)}">${r.score} · ${r.band}${r.conf==='inferred'?' (inf)':''}</span>`;
}
function expCell(d){
  const e=exposure(d);
  if(e.level==='none')return '<span class="mut" style="color:var(--mut)">—</span>';
  const title=(e.hits||[]).map(h=>h.dev+(h.cvss!=null?' (CVSS '+h.cvss.toFixed(1)+')':'')).join(' • ');
  return `<span class="tag ${e.cls}" title="${esc(title)}">${e.maxC>=0?'\u26a0 ':''}${esc(e.label)}</span>`;
}
function incCell(d){
  const inc=INCIDENTS[d.name];
  if(!inc)return '<span style="color:var(--mut)">none found</span>';
  return `<span class="tag v-crit" title="${esc(inc.text)} [Source: ${esc(inc.src)}]">\u26a0 documented breach</span>`;
}
// ---- detail sub-page ----
function openDetail(i){
  const h=data[i], e=exposure(h), r=risk(h), inc=INCIDENTS[h.name];
  let cveRows='';
  (e.hits||[]).forEach(hit=>{ const c=CVEDB.find(c=>c.device===hit.dev); if(!c)return;
    const sev=c.maxCvss!=null?(c.maxCvss>=9?'v-crit':c.maxCvss>=7?'v-high':'v-med'):'v-inf';
    const rm={'likely-remediated':['v-cfleet','likely remediated'],'partial':['v-med','partial'],'residual':['v-crit','residual/active'],'verify':['v-inf','verify']}[c.rem]||['v-def','—'];
    cveRows+=`<tr><td><b>${esc(c.device)}</b><br><span class="mut">${hit.conf?'confirmed device':'inferred device'}</span></td>
      <td><span class="tag ${sev}">${c.maxCvss!=null?c.maxCvss.toFixed(1):'n/a'}</span></td>
      <td><span class="tag ${rm[0]}">${rm[1]}</span><br><span class="mut" style="font-size:11px">${esc(c.remNote||'')}</span></td>
      <td>${esc(c.keyCves)}</td>
      <td>${esc(c.remediation)}<br><b>${esc(c.status)}</b>${c.rem!=='likely-remediated'&&c.mitig?`<br><span style="color:#8f1d1d;font-weight:700">If unpatched, mitigate:</span> <span style="font-size:11px">${esc(c.mitig)}</span>`:''}</td>
      <td><a href="${c.url}" target="_blank" rel="noopener">${esc(c.advisory)}</a></td></tr>`; });
  if(!cveRows)cveRows='<tr><td colspan="6" class="mut">No catalogued CVEs for the tagged devices.</td></tr>';
  const posture=postureAction(h).map(a=>`<li>${esc(a)}</li>`).join('');
  const chips=(h.vendors||[]).map(v=>`<span class="tag ${vclass(v)}">${esc(v)}</span>`).join('');
  const sugg=['What is the single biggest risk here?','What should we fix first?','Has this hospital had a security breach?','Which devices are vulnerable and why?','Is the device data confirmed or inferred?'];
  document.getElementById('detailpanel').innerHTML=`
    <div class="detail-head">
      <div><div class="dh-title">${esc(h.name)}</div>
        <div class="dh-sub">${esc(h.city)}, ${esc(h.state)} &middot; ${esc(h.system)} &middot; ${esc(h.type)}${h.beds?' &middot; '+(+h.beds).toLocaleString()+' beds':''}</div></div>
      <button onclick="closeDetail()">Close \u2715</button>
    </div>
    <div class="detail-body">
      <div class="d-risk ${r.cls}"><div class="d-risk-score">${r.score}</div>
        <div><div class="d-risk-band">${r.band.toUpperCase()} RISK${r.conf==='inferred'?' &middot; inferred':''}</div>
        <div class="mut" style="font-size:12px;margin-top:3px">${esc(r.why)}</div></div></div>
      <div class="d-section"><h3>Device fleet</h3><div>${chips||'<span class="mut">none tagged</span>'}</div></div>
      <div class="d-section"><h3>Inferred network topology &amp; risk</h3>
        <div class="mut" style="font-size:12px;margin-bottom:8px">This site's (inferred) fleet placed on a reference clinical-network architecture. Nodes are coloured by <b>active risk</b> (CVSS discounted by remediation likelihood); the dashed red path shows lateral-movement risk if segmentation is incomplete. Topology and component/SBOM data are <b>inferred</b>, not the hospital's actual network map.</div>
        ${networkDiagram(h)}</div>
      <div class="d-section"><h3>CVE exposure</h3>
        <div class="mut" style="font-size:12px;margin-bottom:6px">CVEs are real (CISA ICS Medical Advisories). Whether this site has patched is unknown &mdash; treat as potential, to verify. Exposure inherits the device's confidence.</div>
        <table><tr><th>Device</th><th>Max CVSS</th><th>Likely status now</th><th>Key CVEs</th><th>Remediation</th><th>Advisory</th></tr>${cveRows}</table></div>
      <div class="d-section"><h3>Security incident history</h3>
        ${inc?`<div class="note v-crit-note">\u26a0 ${esc(inc.text)}<br><b>Source:</b> ${esc(inc.src)}</div>`:`<div class="mut">No public incident found in this pass. Verify via the HHS OCR breach portal &mdash; absence here is not proof of none.</div>`}</div>
      <div class="d-section"><h3>Recommended posture improvements</h3><ol>${posture}</ol></div>
      <div class="d-section qa">
        <h3>Ask the security agent about this hospital</h3>
        <div class="mut" style="font-size:12px;margin-bottom:8px">An agent that queries this hospital's record (and the wider tracker if useful), separates confirmed from inferred, and proposes mitigations for un-remediated vulnerabilities. Tools used are shown with each answer.</div>
        <div class="sugg">${sugg.map(s=>`<span class="tag" onclick="document.getElementById('ragq').value=this.textContent">${esc(s)}</span>`).join('')}</div>
        <textarea id="ragq" placeholder="Ask a question — e.g. What's the most exploitable device, and what would you fix first?"></textarea>
        <div><button class="primary" onclick="askRAG(${i})">Ask a question</button></div>
        <div id="ragout" class="ragout"></div>
      </div>
    </div>`;
  document.getElementById('detailbg').classList.add('open');
}
function closeDetail(){document.getElementById('detailbg').classList.remove('open');}
// ---- inferred network topology + risk visualization (SVG) ----
function networkDiagram(h){
  const REMF={'likely-remediated':0.35,'partial':0.7,'residual':1.0,'verify':0.6};
  const COMP={'GE':'MDhex · hard-coded SMB creds · exposed SMB/UDP','Philips':'cert- & input-validation components',
    'BD Alaris':'URGENT/11 (IPnet stack) · Log4Net · ENEA OS','Baxter':'Telnet/FTP services · hard-coded creds','B. Braun':'SpaceCom web-interface components'};
  function pick(keys){ const tag=(h.vendors||[]).find(v=>keys.some(k=>v.indexOf(k)>=0)); if(!tag)return null;
    let cve=null; CVEDB.forEach(c=>{if(c.match.some(m=>tag.indexOf(m)>=0)){ if(!cve||(c.maxCvss||0)>(cve.maxCvss||0))cve=c; }});
    return {tag,cve,conf:/confirmed/.test(tag)}; }
  function actColor(cve,kind){ if(kind==='ehr')return {c:'#dbe7f5',s:'#5a8fc0',t:'#12507f'};
    if(!cve||cve.maxCvss==null)return {c:'#eef1f3',s:'#c3ccd3',t:'#4a5a66'};
    const a=cve.maxCvss*(REMF[cve.rem]||0.6);
    if(a>=8)return {c:'#f6d2d2',s:'#c94b4b',t:'#8f1d1d'};
    if(a>=6)return {c:'#f7e0cc',s:'#d98b4a',t:'#8a4b12'};
    if(a>=3)return {c:'#f6efcf',s:'#cbb43f',t:'#6f5f0b'};
    return {c:'#d8efe3',s:'#4fae83',t:'#0f6e56'}; }
  function shortLbl(tag,kind){ if(!tag)return '—';
    if(kind==='ehr')return tag.replace(/ EHR.*/,''); if(kind==='mon')return 'Philips / GE monitors';
    if(kind==='pump')return tag.replace(/ System.*| \(.*/,''); if(kind==='vent')return 'Medtronic / Dräger vents'; return tag; }
  const esc2=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const box=(x,y,w,hh,f,st,rx)=>`<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="${rx||6}" fill="${f}" stroke="${st}" stroke-width="1"/>`;
  const txt=(x,y,t,fs,fill,anc,wt)=>`<text x="${x}" y="${y}" font-size="${fs}" fill="${fill}" text-anchor="${anc||'start'}" font-family="Inter,system-ui,sans-serif"${wt?` font-weight="${wt}"`:''}>${esc2(t)}</text>`;
  const line=(x1,y1,x2,y2,st,dash,w)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${st}" stroke-width="${w||1}"${dash?` stroke-dasharray="${dash}"`:''} marker-end="url(#ar)"/>`;
  const zones=[
    {x:30,title:'EHR / data center',kind:'ehr',p:pick(['EHR'])},
    {x:242,title:'Patient monitoring',kind:'mon',p:pick(['Patient monitors','CARESCAPE','IntelliVue'])},
    {x:454,title:'Infusion pumps',kind:'pump',p:pick(['BD Alaris','Baxter','Braun'])},
    {x:666,title:'Ventilators / biomed',kind:'vent',p:pick(['Ventilator','Dräger vent'])},
  ];
  const W=880,H=548,zw=184,zy=210,zh=150;
  let s=`<svg viewBox="0 0 ${W} ${H}" width="100%" xmlns="http://www.w3.org/2000/svg" style="border:1px solid var(--line);border-radius:10px;background:#fbfcfd">`;
  s+=`<defs><marker id="ar" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#9aa7b0"/></marker></defs>`;
  // internet + firewall + IT LAN
  s+=box(360,10,160,30,'#eef2f5','#c3ccd3')+txt(440,30,'Internet / external',12,'#4a5a66','middle');
  s+=line(440,40,440,52,'#9aa7b0');
  s+=box(384,54,112,26,'#e8eef3','#c3ccd3')+txt(440,71,'\u{1F6E1} Perimeter firewall',11,'#33454f','middle');
  s+=line(440,80,440,95,'#9aa7b0');
  s+=box(30,96,820,66,'#f6f2ea','#e2d7c1')+txt(42,114,'Business / IT network',12,'#7a5b0b','start','700');
  s+=box(48,122,150,30,'#fff','#e2d7c1')+txt(123,141,'Clinician workstations',10,'#5a4a20','middle');
  s+=box(210,122,150,30,'#fff','#e2d7c1')+txt(285,141,'Email / identity',10,'#5a4a20','middle');
  s+=txt(838,141,'\u2190 common ransomware / phishing entry',10.5,'#8a4b12','end');
  // segmentation boundary
  s+=`<line x1="30" y1="186" x2="850" y2="186" stroke="#8f1d1d" stroke-width="1.5" stroke-dasharray="7 5"/>`;
  s+=txt(440,181,'\u21CE clinical-network segmentation — inferred PARTIAL (the decisive control)',11,'#8f1d1d','middle','600');
  // zones
  let compLines=[];
  zones.forEach(z=>{
    const p=z.p, cve=p&&p.cve, col=actColor(cve,z.kind);
    const cx=z.x+zw/2;
    // connection line from IT LAN down through boundary
    const lineCol = (z.kind!=='ehr'&&cve&&cve.maxCvss!=null&&(cve.maxCvss*(REMF[cve.rem]||0.6))>=6)?'#c94b4b':'#b8c2ca';
    s+=`<line x1="${cx}" y1="162" x2="${cx}" y2="${zy}" stroke="${lineCol}" stroke-width="${lineCol==='#c94b4b'?1.8:1}"${lineCol==='#c94b4b'?' stroke-dasharray="4 3"':''} marker-end="url(#ar)"/>`;
    // zone frame
    s+=box(z.x,zy,zw,zh,'#ffffff','#e4e9ec',8);
    s+=txt(cx,zy+18,z.title,11,'#33454f','middle','700');
    if(!p){ s+=txt(cx,zy+70,'not tagged',11,'#9aa7b0','middle'); return; }
    // device node
    s+=box(z.x+14,zy+30,zw-28,64,col.c,col.s,7);
    s+=txt(cx,zy+50,shortLbl(p.tag,z.kind),11.5,col.t,'middle','700');
    if(z.kind==='ehr'){ s+=txt(cx,zy+68,'crown jewel',10,col.t,'middle'); s+=txt(cx,zy+82,'(not device-CVE scope)',9.5,'#5a7a95','middle'); }
    else if(cve&&cve.maxCvss!=null){
      s+=txt(cx,zy+68,'CVSS '+cve.maxCvss.toFixed(1),11,col.t,'middle','700');
      const remTxt={'likely-remediated':'likely remediated','partial':'partial','residual':'RESIDUAL/ACTIVE','verify':'verify'}[cve.rem]||'';
      s+=txt(cx,zy+83,remTxt,9.5,col.t,'middle');
    } else { s+=txt(cx,zy+72,'advisories — verify',10,col.t,'middle'); }
    // confidence pill under node
    s+=txt(cx,zy+112,(p.conf?'\u25CF device confirmed':'\u25D0 device inferred'),10,p.conf?'#0f6e56':'#854f0b','middle','600');
    // component (SBOM) line
    if(cve){ const key=Object.keys(COMP).find(k=>cve.match.indexOf(k)>=0 || (cve.device.indexOf(k)>=0)); if(key){ s+=txt(cx,zy+132,'components:',9,'#7a8a94','middle','600'); s+=`<foreignObject x="${z.x+6}" y="${zy+136}" width="${zw-12}" height="16"><div xmlns="http://www.w3.org/1999/xhtml" style="font:9px Inter,system-ui;color:#7a8a94;text-align:center;line-height:1.15">${esc2(COMP[key])}</div></foreignObject>`; compLines.push(shortLbl(p.tag,z.kind)+': '+COMP[key]); } }
  });
  // legend
  const ly=zy+zh+18;
  s+=txt(30,ly,'Node colour = active risk (CVSS × remediation likelihood):',11,'#33454f','start','600');
  const leg=[['#f6d2d2','#c94b4b','critical/residual'],['#f7e0cc','#d98b4a','high'],['#f6efcf','#cbb43f','medium'],['#d8efe3','#4fae83','likely remediated'],['#dbe7f5','#5a8fc0','EHR (data)'],['#eef1f3','#c3ccd3','no known CVE']];
  let lx=30; const lyy=ly+12;
  leg.forEach(([f,st,l])=>{ s+=box(lx,lyy,13,13,f,st,3)+txt(lx+18,lyy+11,l,10,'#4a5a66','start'); lx+=Math.max(96,l.length*6.4+34); });
  s+=txt(30,ly+44,'Confidence: \u25CF confirmed device · \u25D0 inferred (market-share/system hypothesis, to verify). Red dashed path = lateral-movement risk if segmentation is incomplete.',10,'#7a8a94','start');
  s+=txt(30,ly+60,'"Components" are inferred from public CISA advisories — a proxy for the device SBOM, NOT the vendor\u2019s actual SBOM. This is a reference topology, not the hospital\u2019s real network map.',10,'#7a8a94','start');
  s+=`</svg>`;
  return s;
}
// ---- RAG: retrieve this hospital's structured record, ask the model against it ----
function ragContext(h){
  const e=exposure(h), r=risk(h), inc=INCIDENTS[h.name];
  let c=`HOSPITAL: ${h.name}\nLocation: ${h.city}, ${h.state}\nSystem: ${h.system}\nType: ${h.type}\nStaffed beds: ${h.beds||'unknown'}\n\nDEVICES / VENDORS (with confidence label):\n`;
  (h.vendors||[]).forEach(v=>c+=` - ${v}\n`);
  c+=`\nKNOWN CVE EXPOSURE (CISA ICS Medical Advisories / NVD):\n`;
  let any=false;
  (e.hits||[]).forEach(hit=>{const cv=CVEDB.find(x=>x.device===hit.dev); if(!cv)return; any=true;
    c+=` - ${cv.device} [${hit.conf?'device CONFIRMED':'device INFERRED'}]: max CVSS ${cv.maxCvss!=null?cv.maxCvss:'n/a'}; ${cv.keyCves}; exploitability: ${cv.exploit}; remediation: ${cv.remediation} (${cv.status}); advisory ${cv.advisory}\n`;});
  if(!any)c+=' (none of the tagged devices have catalogued CVEs)\n';
  c+=`\nCOMPOSITE RISK: ${r.score}/100 (${r.band}). ${r.why}\n`;
  c+=`\nDOCUMENTED SECURITY INCIDENT: ${inc?inc.text+' [Source: '+inc.src+']':'None found in public records in this pass (verify via HHS OCR breach portal; absence is not proof of none).'}\n`;
  c+=`\nRECOMMENDED POSTURE ACTIONS:\n`; postureAction(h).forEach(a=>c+=` - ${a}\n`);
  c+=`\nCONFIDENCE NOTE: "(inferred)" device tags are market-share/system-standard hypotheses to confirm, NOT facts; "(confirmed-fleet/research)" are cited. CVE exposure inherits the device's confidence.\n`;
  return c;
}
function renderAnswer(t){
  return esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').split(/\n\n+/).map(p=>'<p>'+p.replace(/\n/g,'<br>')+'</p>').join('');
}
// shared RAG runner: tries the Anthropic API with a timeout, falls back to a local answer that always works
// ---- AGENTIC assistant: the model plans, calls tools over the tracker dataset, iterates, then answers.
//      Falls back to the local engine when the Anthropic API isn't reachable (self-hosted without a proxy).
const AGENT_TOOLS=[
  {name:'list_hospitals',description:'Filter & rank hospitals by state, minimum risk score, incident history, or a device/vendor substring. Returns name, state, beds, risk score+band, confidence, and whether a documented incident exists.',
   input_schema:{type:'object',properties:{state:{type:'string',description:'MA, NH, RI, IL, MN, or MD'},min_risk:{type:'number'},has_incident:{type:'boolean'},device_contains:{type:'string',description:'e.g. GE, BD Alaris, Epic'},limit:{type:'number'}}}},
  {name:'get_hospital',description:'Full record for one hospital: devices (with confidence), CVE exposure, risk breakdown, incident, recommended posture actions.',
   input_schema:{type:'object',properties:{name:{type:'string'}},required:['name']}},
  {name:'get_device_cve',description:'CVE details for a device family (GE, BD Alaris, Baxter, B. Braun, Philips, ventilator): CVSS, key CVEs, exploitability, remediation likelihood, and compensating-control mitigations if not remediated.',
   input_schema:{type:'object',properties:{device:{type:'string'}},required:['device']}},
  {name:'list_cves',description:'The full device-CVE library with CVSS, likely remediation status, and mitigations.',input_schema:{type:'object',properties:{}}},
];
function toolExec(name,input){
  input=input||{};
  if(name==='list_hospitals'){
    let rows=data.map(h=>({h,r:risk(h)}));
    if(input.state)rows=rows.filter(x=>x.h.state===String(input.state).toUpperCase());
    if(input.has_incident)rows=rows.filter(x=>INCIDENTS[x.h.name]);
    if(input.device_contains)rows=rows.filter(x=>(x.h.vendors||[]).some(v=>v.toLowerCase().includes(String(input.device_contains).toLowerCase())));
    if(typeof input.min_risk==='number')rows=rows.filter(x=>x.r.score>=input.min_risk);
    rows.sort((a,b)=>b.r.score-a.r.score);
    if(input.limit)rows=rows.slice(0,input.limit);
    return JSON.stringify({count:rows.length,hospitals:rows.map(x=>({name:x.h.name,state:x.h.state,beds:x.h.beds,risk:x.r.score,band:x.r.band,confidence:x.r.conf,incident:INCIDENTS[x.h.name]?INCIDENTS[x.h.name].text.split('.')[0]:null}))});
  }
  if(name==='get_hospital'){
    const h=data.find(d=>d.name.toLowerCase()===String(input.name).toLowerCase())||data.find(d=>d.name.toLowerCase().includes(String(input.name).toLowerCase()));
    if(!h)return JSON.stringify({error:'no hospital named '+input.name});
    const e=exposure(h),r=risk(h),inc=INCIDENTS[h.name];
    return JSON.stringify({name:h.name,state:h.state,city:h.city,system:h.system,beds:h.beds,
      devices:h.vendors,risk:{score:r.score,band:r.band,confidence:r.conf,breakdown:r.why},
      cve_exposure:(e.hits||[]).map(x=>{const c=CVEDB.find(c=>c.device===x.dev);return c?{device:c.device,maxCvss:c.maxCvss,likely_status:c.rem,note:c.remNote,mitigation_if_unpatched:c.mitig,advisory:c.advisory}:null;}).filter(Boolean),
      incident:inc?{summary:inc.text,source:inc.src}:null, posture_actions:postureAction(h)});
  }
  if(name==='get_device_cve'){
    const c=CVEDB.find(c=>c.match.some(m=>String(input.device).toLowerCase().includes(m.toLowerCase()))||c.device.toLowerCase().includes(String(input.device).toLowerCase()));
    if(!c)return JSON.stringify({error:'no device matching '+input.device});
    return JSON.stringify({device:c.device,maxCvss:c.maxCvss,keyCves:c.keyCves,exploitability:c.exploit,likely_status:c.rem,note:c.remNote,vendor_remediation:c.remediation+' ('+c.status+')',mitigation_if_unpatched:c.mitig,advisory:c.advisory,url:c.url});
  }
  if(name==='list_cves')return JSON.stringify(CVEDB.map(c=>({device:c.device,maxCvss:c.maxCvss,likely_status:c.rem,mitigation_if_unpatched:c.mitig,advisory:c.advisory})));
  return JSON.stringify({error:'unknown tool'});
}
const SYS_AGENT="You are BitSense's medical-device security analyst agent. You have tools to query a tracker of 85 US hospitals (device fleets, CVE exposure, composite risk, documented incidents) and a CISA advisory library with compensating-control mitigations. Plan, call tools to gather exactly what you need (you may call several), then answer. Rules: (1) Use ONLY tool results — never invent hospitals, devices, CVEs, or numbers. (2) Distinguish CONFIRMED (cited) from INFERRED (market-share/system hypothesis); never assert inferred as fact — say 'likely/inferred, to verify'. (3) When a vulnerability is not remediated, give the compensating-control mitigations from the tools. (4) Cite advisory IDs and incident sources. (5) Be concise and practical for a vCISO — lead with the answer, then the why. Risk scores discount likely-remediated CVEs; GE MDhex stays full-weight because its fix is network config, commonly incomplete.";

async function runAgent(outId,question,hint,localFn){
  const out=document.getElementById(outId); if(!out)return;
  if(!question||!question.trim()){ out.innerHTML='<span class="mut">Type a question first.</span>'; return; }
  // 1) INSTANT local answer — always works, even with no API
  out.className='ragout';
  out.innerHTML='<div class="mut" style="font-size:11px;margin-bottom:6px">\u26A1 instant answer &middot; <span id="'+outId+'_st">checking live agent\u2026</span></div>'+localFn();
  // 2) try the agent in the background; replace on success
  let messages=[{role:'user',content:(hint?hint+'\n\n':'')+question}];
  const used=[];
  try{
    for(let step=0; step<5; step++){
      const ctrl=new AbortController(); const to=setTimeout(()=>ctrl.abort(),10000);
      const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},signal:ctrl.signal,
        body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1200,system:SYS_AGENT,tools:AGENT_TOOLS,messages})});
      clearTimeout(to);
      if(!res.ok)throw new Error('http '+res.status);
      const d=await res.json();
      const toolUses=(d.content||[]).filter(b=>b.type==='tool_use');
      if(d.stop_reason==='tool_use' && toolUses.length){
        const stEl=document.getElementById(outId+'_st'); if(stEl)stEl.textContent='running '+toolUses.map(t=>t.name).join(', ')+'\u2026';
        messages.push({role:'assistant',content:d.content});
        messages.push({role:'user',content:toolUses.map(t=>{used.push(t.name);return{type:'tool_result',tool_use_id:t.id,content:toolExec(t.name,t.input)};})});
        continue;
      }
      const text=(d.content||[]).map(b=>b.type==='text'?b.text:'').join('').trim();
      if(text){
        const trace='<div class="mut" style="font-size:11px;margin-bottom:8px">\u{1F916} agent'+(used.length?' &middot; tools: '+esc([...new Set(used)].join(', ')):'')+'</div>';
        out.innerHTML=trace+renderAnswer(text);
      }
      return;
    }
  }catch(err){
    const stEl=document.getElementById(outId+'_st');
    if(stEl){ stEl.textContent='live agent unavailable — local answer shown'; stEl.style.color='var(--mut)'; }
  }
}
// legacy single-shot (kept as a simple fallback path if ever needed)
async function runRAG(outId,sys,context,q,localFn){ return runAgent(outId,q,'CONTEXT:\n'+context,localFn); }
const SYS_HOSP="You are a medical-device security analyst assistant for BitSense. Answer about ONE hospital using ONLY the CONTEXT. Distinguish CONFIRMED (cited) from INFERRED (hypothesis) — never state inferred as fact. Cite sources present in the context. If a vulnerability is not remediated, propose the compensating-control mitigations shown. If the answer isn't in context, say so and suggest how to get it. Never invent CVEs/incidents/numbers. Be concise and practical.";
const SYS_GLOBAL="You are a medical-device security analyst assistant for BitSense advising a vCISO across a multi-state hospital portfolio. Answer using ONLY the CONTEXT (portfolio summary + per-hospital risk lines). Distinguish confirmed from inferred. Be concise; when ranking, name hospitals and their risk scores. Never invent data.";
const SYS_DEV="You are a medical-device security analyst assistant for BitSense. Answer about medical-device vulnerabilities using ONLY the CONTEXT (CISA advisory library with CVSS, remediation likelihood, and compensating-control mitigations). When a vulnerability is not remediated, give the mitigations. Cite advisory IDs. Never invent CVEs.";
// ---- local retrieval answer engines (work with no API) ----
function ln(s){return s+'\n';}
function localHosp(h,q){
  const e=exposure(h),r=risk(h),inc=INCIDENTS[h.name],ql=q.toLowerCase();
  const worst=(e.hits||[]).map(x=>CVEDB.find(c=>c.device===x.dev)).filter(Boolean).sort((a,b)=>(b.maxCvss||0)-(a.maxCvss||0))[0];
  let out='';
  const hit=w=>w.some(x=>ql.includes(x));
  if(hit(['biggest','worst','most','priority','top risk','main risk'])){
    out+=ln(`<b>${esc(h.name)}</b> scores <b>${r.score}/100 (${r.band}${r.conf==='inferred'?', inferred':''})</b>.`);
    if(worst)out+=ln(`Top driver: <b>${esc(worst.device)}</b> — CVSS ${worst.maxCvss}, ${worst.rem==='residual'?'<b>residual/active</b> (config-dependent fix, commonly incomplete)':worst.rem}.`);
    out+=ln('Reasoning: '+esc(r.why));
  } else if(hit(['fix','remediat','mitigat','first','should','harden','protect','improve','recommend'])){
    out+=ln('<b>Recommended actions:</b>'); postureAction(h).forEach(a=>out+=ln('• '+esc(a)));
    if(worst&&worst.mitig&&worst.rem!=='likely-remediated')out+=ln(`<b>If ${esc(worst.device.split(' (')[0])} is unpatched, compensating controls:</b> ${esc(worst.mitig)}`);
  } else if(hit(['breach','incident','attack','hack','ransom','history'])){
    out+= inc? ln('<b>Documented incident:</b> '+esc(inc.text))+ln('<i>Source: '+esc(inc.src)+'</i>')
             : ln('No public incident was found for this hospital in this pass. Verify via the HHS OCR breach portal (ocrportal.hhs.gov/ocr/breach) — absence is not proof of none.');
  } else if(hit(['confirm','inferred','sure','confidence','certain','know'])){
    const conf=(h.vendors||[]).filter(v=>/confirmed/.test(v)), infd=(h.vendors||[]).filter(v=>/inferred/.test(v));
    out+=ln(`Confirmed (cited): ${conf.length?esc(conf.join('; ')):'none'}.`);
    out+=ln(`Inferred (hypotheses to verify): ${infd.length?esc(infd.join('; ')):'none'}.`);
    out+=ln('Exposure and risk inherit the device confidence — inferred devices produce inferred exposure.');
  } else if(hit(['vulnerab','cve','exposure','remediat','patched','active'])){
    if(e.hits&&e.hits.length){ out+=ln('<b>Known CVE exposure (inherits device confidence):</b>');
      e.hits.forEach(x=>{const c=CVEDB.find(c=>c.device===x.dev); if(c)out+=ln(`• ${esc(c.device)} — CVSS ${c.maxCvss||'n/a'}, <b>${c.rem}</b>. ${esc(c.remNote||'')}`);});
    } else out+=ln('No catalogued CVEs for the tagged devices.');
  } else if(hit(['device','equipment','fleet','vendor','ehr','epic','cerner','monitor','pump','ventilator'])){
    out+=ln('<b>Device fleet (with confidence):</b>'); (h.vendors||[]).forEach(v=>out+=ln('• '+esc(v)));
  } else {
    out+=ragContext(h).split('\n').map(esc).join('<br>');
  }
  return '<div class="mut" style="margin-bottom:8px;font-size:12px">Local answer (from this hospital\u2019s record). Live AI needs the Anthropic API \u2014 works in Claude.ai or via your Worker proxy.</div>'+out.replace(/\n/g,'<br>');
}
function localGlobal(q){
  const ql=q.toLowerCase(); const hit=w=>w.some(x=>ql.includes(x));
  let out='';
  const ranked=data.map(h=>({h,r:risk(h)})).sort((a,b)=>b.r.score-a.r.score);
  const SNAMES={MA:'massachus',NH:'new hampshire',RI:'rhode island',IL:'illinois',MN:'minnesota',MD:'maryland'};
  const STATES=['MA','NH','RI','IL','MN','MD'];
  const stMatch=STATES.find(s=>ql.includes(' '+s.toLowerCase()+' ')||ql.includes(SNAMES[s]));
  if(hit(['highest','most vulnerable','riskiest','worst','top','most at risk','priority'])){
    out+=ln('<b>Highest active-risk hospitals:</b>');
    ranked.slice(0,8).forEach((x,i)=>out+=ln(`${i+1}. ${esc(x.h.name)} (${x.h.state}) — ${x.r.score}/100 ${x.r.band}${x.r.conf==='inferred'?' · inf':''}`));
  } else if(hit(['breach','incident','ransom','attack','hack'])){
    out+=ln('<b>Hospitals with documented incidents:</b>');
    Object.keys(INCIDENTS).forEach(n=>out+=ln('• '+esc(n)+' — '+esc(INCIDENTS[n].text.split('.')[0])+'.'));
  } else if(hit(['ge','carescape','mdhex'])){
    const ges=data.filter(h=>(h.vendors||[]).some(v=>/Patient monitors|CARESCAPE/.test(v)));
    out+=ln(`<b>${ges.length}</b> hospitals carry inferred GE/Philips monitors (GE CARESCAPE MDhex = CVSS 10, residual if unsegmented). Because the monitor tag is inferred Philips-or-GE, treat MDhex exposure as a worst-case to confirm.`);
  } else if(stMatch){
    const hs=data.filter(h=>h.state===stMatch).map(h=>({h,r:risk(h)})).sort((a,b)=>b.r.score-a.r.score);
    out+=ln(`<b>${stMatch} hospitals (${hs.length}), by risk:</b>`); hs.forEach(x=>out+=ln(`• ${esc(x.h.name)} — ${x.r.score} ${x.r.band}`));
  } else if(hit(['how many','count','total','summary','overview'])){
    let crit=ranked.filter(x=>x.r.band==='critical').length, high=ranked.filter(x=>x.r.band==='high').length;
    out+=ln(`Portfolio: <b>${data.length} hospitals</b> across 6 states (MA/NH/RI/IL/MN/MD). Critical: ${crit}, High: ${high}. Documented incidents: ${Object.keys(INCIDENTS).length} tracked entries.`);
  } else {
    out+=ln('Try: "highest-risk hospitals", "which have documented breaches", "hospitals in MN", "how many critical", or open a hospital for its detail + Ask box.');
    out+=ln(`Quick take: top risk is <b>${esc(ranked[0].h.name)}</b> at ${ranked[0].r.score}/100.`);
  }
  return '<div class="mut" style="margin-bottom:8px;font-size:12px">Local answer (across all '+data.length+' hospitals). Live AI needs the Anthropic API.</div>'+out.replace(/\n/g,'<br>');
}
function localDevice(q){
  const ql=q.toLowerCase(); const hit=w=>w.some(x=>ql.includes(x));
  let out=''; let match=CVEDB.filter(c=>c.match.some(m=>ql.includes(m.toLowerCase()))||ql.includes(c.device.toLowerCase().split(' ')[0]));
  if(hit(['mdhex','carescape','ge'])&&!match.length)match=[CVEDB.find(c=>/GE/.test(c.device))];
  if(!match.length&&hit(['alaris','bd']))match=[CVEDB.find(c=>/Alaris/.test(c.device))];
  if(!match.length&&hit(['baxter','spectrum']))match=[CVEDB.find(c=>/Baxter/.test(c.device))];
  if(!match.length&&hit(['braun','infusomat']))match=[CVEDB.find(c=>/Braun/.test(c.device))];
  if(!match.length&&hit(['philips','intellivue']))match=[CVEDB.find(c=>/Philips/.test(c.device))];
  const wantMitig=hit(['mitigat','not remediat','unpatched','compensat','if not','residual','isolate','segment','control']);
  if(!match.length)match=CVEDB.filter(c=>c.maxCvss!=null).sort((a,b)=>b.maxCvss-a.maxCvss);
  match.filter(Boolean).forEach(c=>{
    out+=ln(`<b>${esc(c.device)}</b> — max CVSS ${c.maxCvss||'n/a'}, ${c.advisory}. Likely status: <b>${c.rem}</b>. ${esc(c.remNote||'')}`);
    if(wantMitig||c.rem==='residual'||c.rem==='partial'){ if(c.mitig)out+=ln(`<b>Mitigations if unpatched:</b> ${esc(c.mitig)}`); }
    out+='\n';
  });
  return '<div class="mut" style="margin-bottom:8px;font-size:12px">Local answer (device CVE library + mitigations). Live AI needs the Anthropic API.</div>'+out.replace(/\n/g,'<br>');
}
function askRAG(i){ const q=(document.getElementById('ragq').value||''); runAgent('ragout',q,'Focus on this hospital unless asked otherwise: "'+data[i].name+'". Use get_hospital first.',()=>localHosp(data[i],q)); }
function askGlobal(){ const q=(document.getElementById('ragq_g').value||''); runAgent('ragout_g',q,'Portfolio-wide question across all hospitals. Use list_hospitals to filter/rank.',()=>localGlobal(q)); }
function askDevice(){ const q=(document.getElementById('ragq_d').value||''); runAgent('ragout_d',q,'Question about device vulnerabilities. Use get_device_cve or list_cves; include mitigations if not remediated.',()=>localDevice(q)); }
function globalContext(){
  let c='PORTFOLIO: '+data.length+' hospitals across MA/NH/RI/IL/MN/MD.\n\nPER-HOSPITAL RISK (name, state, beds, active-risk score/band, confidence, documented incident):\n';
  data.map(h=>({h,r:risk(h)})).sort((a,b)=>b.r.score-a.r.score).forEach(x=>{
    c+=` - ${x.h.name} (${x.h.state}, ${x.h.beds||'?'} beds): risk ${x.r.score}/100 ${x.r.band} [${x.r.conf}]${INCIDENTS[x.h.name]?' · INCIDENT: '+INCIDENTS[x.h.name].text.split('.')[0]:''}\n`;
  });
  c+='\nConfidence note: most device tags are inferred (market-share/system hypotheses). Risk inherits that confidence.\n';
  return c;
}
function deviceContext(){
  let c='DEVICE CVE LIBRARY (CISA ICS Medical Advisories / NVD):\n';
  CVEDB.forEach(cv=>{ c+=`\n- ${cv.device}\n  Max CVSS: ${cv.maxCvss!=null?cv.maxCvss:'n/a'} · Advisory: ${cv.advisory}\n  Key CVEs: ${cv.keyCves}\n  Exploitability: ${cv.exploit}\n  Likely status now: ${cv.rem} — ${cv.remNote||''}\n  Vendor remediation: ${cv.remediation} (${cv.status})\n  Compensating controls if NOT remediated: ${cv.mitig||'verify per model'}\n`; });
  return c;
}
function statusSel(i,val){const opts=['Not started','Researching','Contacted','Meeting set','Won','Lost'];
  return `<select onchange="upd(${i},'status',this.value)">`+opts.map(o=>`<option${o===(val||'Not started')?' selected':''}>${o}</option>`).join('')+'</select>'}
function addTag(i,v){v=(v||'').trim();if(!v)return;data[i].vendors=data[i].vendors||[];
  if(!data[i].vendors.includes(v))data[i].vendors.push(v);save();renderHosp()}
function delTag(i,j){data[i].vendors.splice(j,1);save();renderHosp()}
function upd(i,f,v){data[i][f]=v;save();if(f==='status')renderHosp()}
function setSort(c){if(sort.col===c)sort.dir*=-1;else{sort.col=c;sort.dir=(c==='beds'?-1:1)}saveSort();renderHosp()}

// ---------- vendors (inverted) ----------
function vendorIndex(){
  const idx={};
  data.forEach((d,i)=>(d.vendors||[]).forEach(v=>{(idx[v]=idx[v]||[]).push({name:d.name,i})}));
  return Object.entries(idx).map(([vendor,hosps])=>({vendor,n:hosps.length,hosps}));
}
function sortVend(c){if(vsort.col===c)vsort.dir*=-1;else{vsort.col=c;vsort.dir=(c==='n'?-1:1)}renderVend()}
function renderVend(){
  let list=vendorIndex();
  const q=document.getElementById('vsearch').value.toLowerCase();
  if(q)list=list.filter(x=>x.vendor.toLowerCase().includes(q));
  list.sort((a,b)=>{let x=a[vsort.col],y=b[vsort.col];if(typeof x==='string'){x=x.toLowerCase();y=y.toLowerCase()}
    return x<y?-1*vsort.dir:x>y?1*vsort.dir:0});
  document.getElementById('va-vendor').textContent=vsort.col==='vendor'?(vsort.dir<0?'\u25bc':'\u25b2'):'';
  document.getElementById('va-n').textContent=vsort.col==='n'?(vsort.dir<0?'\u25bc':'\u25b2'):'';
  const body=document.getElementById('vbody');
  if(!list.length){body.innerHTML=`<tr><td colspan="3" class="empty">No device tags yet. Add vendors on the Hospitals tab and they\u2019ll appear here inverted.</td></tr>`;}
  else body.innerHTML=list.map(x=>`<tr>
    <td><b><span class="tag ${vclass(x.vendor)}">${esc(x.vendor)}</span></b></td><td class="num">${x.n}</td>
    <td>${x.hosps.map(h=>`<span class="tag" style="cursor:pointer" onclick="jumpTo('${esc(h.name).replace(/'/g,'')}')">${esc(h.name)}</span>`).join('')}</td>
  </tr>`).join('');
  document.getElementById('vcount').textContent=`${list.length} vendor${list.length===1?'':'s'} tracked`;
}
function jumpTo(name){switchTab('hospitals');document.getElementById('search').value=name;renderHosp()}

// ---------- summary ----------
function renderSummary(){
  const total=data.length;
  const beds=data.reduce((s,d)=>s+(+d.beds||0),0);
  const tagged=data.filter(d=>(d.vendors||[]).length).length;
  const active=data.filter(d=>['Contacted','Meeting set','Researching'].includes(d.status)).length;
  document.getElementById('cards').innerHTML=[
    [total,'Hospitals tracked'],[beds.toLocaleString(),'Total staffed beds'],
    [tagged,'With device intel'],[active,'In active outreach']
  ].map(([n,l])=>`<div class="card"><div class="n">${n}</div><div class="l">${l}</div></div>`).join('');
  bar('sysbars',groupCount('system'));
  bar('statbars',groupCount('status',['Not started','Researching','Contacted','Meeting set','Won','Lost']));
  bar('statebars',groupCount('state',['MA','NH','RI']));
  const vi=vendorIndex().sort((a,b)=>b.n-a.n).slice(0,10).map(x=>[x.vendor,x.n]);
  bar('vendbars',vi.length?vi:[['(no vendors tagged yet)',0]]);
}
function groupCount(field,order){
  const m={};data.forEach(d=>{const k=d[field]||'(none)';m[k]=(m[k]||0)+1});
  let e=Object.entries(m);if(order)e=order.map(o=>[o,m[o]||0]);else e.sort((a,b)=>b[1]-a[1]);
  return e;
}
function bar(id,entries){const max=Math.max(1,...entries.map(e=>e[1]));
  document.getElementById(id).innerHTML=entries.map(([l,n])=>`<div class="bar-row">
    <div class="lbl">${esc(l)}</div><div class="bar-track"><div class="bar-fill" style="width:${n/max*100}%"></div></div>
    <div class="val">${n}</div></div>`).join('');
}

// ---------- method ----------
function renderMethod(){
  document.getElementById('srcbody').innerHTML=SOURCES.map(([n,d,u])=>
    `<tr><td><b>${n}</b></td><td>${d}</td><td><a href="${u}" target="_blank" rel="noopener">${u}</a></td></tr>`).join('');
}

// ---------- add / export ----------
function openAdd(){document.getElementById('addmodal').classList.add('open')}
function closeAdd(){document.getElementById('addmodal').classList.remove('open')}
function doAdd(){
  const name=document.getElementById('m_name').value.trim();if(!name){alert('Name required');return}
  data.push({name,state:document.getElementById('m_state').value,city:document.getElementById('m_city').value.trim(),
    system:document.getElementById('m_system').value,type:document.getElementById('m_type').value,
    beds:+document.getElementById('m_beds').value||'',vendors:[],ciso:'',contact:'',title:'',email:'',status:'Not started',notes:''});
  save();closeAdd();['m_name','m_city','m_beds'].forEach(id=>document.getElementById(id).value='');
  switchTab('hospitals');renderHosp();
}
function exportCsv(){
  const head=['name','state','city','system','type','beds','vendors','risk_score','risk_band','exposure_maxcvss','exposure_conf','incident','ciso','notes'];
  const q=v=>{v=Array.isArray(v)?v.join('; '):String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  const lines=[head.join(',')].concat(data.map(d=>{
    const e=exposure(d); const inc=INCIDENTS[d.name]; const r=risk(d);
    const row={...d, risk_score:r.score, risk_band:r.band, exposure_maxcvss:(e.maxC>=0?e.maxC:''), exposure_conf:(e.level==='none'?'':e.conf), incident:(inc?inc.text+' ['+inc.src+']':''), ciso:(d.ciso||'')};
    return head.map(h=>q(row[h])).join(',');
  }));
  const blob=new Blob([lines.join('\n')],{type:'text/csv'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ma_nh_ri_hospitals.csv';a.click();
}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

document.getElementById('vendorlib').innerHTML=VENDOR_LIBRARY.map(v=>`<option value="${esc(v)}">`).join('');
renderMethod();
renderHosp();

// ================= CHATBOT =================
let chatMessages=[]; // {role,text} — final turns for conversational context
let chatInit=false; const bubbleData={}; let bubbleSeq=0;
function openChat(){
  document.getElementById('chatpanel').classList.add('open');
  document.getElementById('chatfab').style.display='none';
  if(!chatInit){
    const hs=document.getElementById('chatHosp');
    hs.innerHTML='<option value="">Pick a hospital…</option>'+data.map((h,i)=>`<option value="${i}">${esc(h.name)} (${esc(h.state)})</option>`).join('');
    const ds=document.getElementById('chatDev');
    ds.innerHTML='<option value="">Pick a device…</option>'+CVEDB.map((c,i)=>`<option value="${i}">${esc(c.device.split(' (')[0])}</option>`).join('');
    addMsg('a','<b>Hi — I\u2019m the BitSense assistant.</b> Ask me anything about the '+data.length+'-hospital portfolio, or set a scope above to focus on one hospital or device. I ground every answer in the tracker (risk, CVEs, remediation, incidents) and separate confirmed from inferred.'+
      '<div class="chat-sugg">'+['Rank the 5 riskiest hospitals and why','Which hospitals have documented breaches?','What mitigates GE MDhex if unpatched?','Which MN hospitals have residual GE exposure?'].map(s=>`<span onclick="quickAsk(this)">${esc(s)}</span>`).join('')+'</div>','BitSense assistant',true);
    chatInit=true;
  }
}
function closeChat(){ document.getElementById('chatpanel').classList.remove('open'); document.getElementById('chatfab').style.display=''; }
function quickAsk(el){ document.getElementById('chatInput').value=el.textContent; sendChat(); }
function onScopeChange(){
  const s=document.getElementById('chatScope').value;
  document.getElementById('chatHosp').style.display=s==='hospital'?'':'none';
  document.getElementById('chatDev').style.display=s==='device'?'':'none';
}
function onPickHospital(){ const i=document.getElementById('chatHosp').value; if(i==='')return; addMsg('a',hospitalBriefing(data[+i]),data[+i].name,true); scrollChat(); }
function onPickDevice(){ const i=document.getElementById('chatDev').value; if(i==='')return; addMsg('a',deviceBriefing(CVEDB[+i]),CVEDB[+i].device.split(' (')[0],true); scrollChat(); }
function scrollChat(){ const m=document.getElementById('chatMsgs'); m.scrollTop=m.scrollHeight; }
function addMsg(role,html,title,withActions){
  const id='b'+(++bubbleSeq); bubbleData[id]={title:title||'BitSense',html};
  const acts=(role==='a'&&withActions)?`<div class="acts"><button onclick="dlPdf('${id}')">\u21E9 PDF</button><button onclick="emailMsg('${id}')">\u2709 Email</button></div>`:'';
  const div=document.createElement('div'); div.className='msg '+role; div.id=id; div.innerHTML=html+acts;
  document.getElementById('chatMsgs').appendChild(div); scrollChat(); return id;
}
function currentScope(){
  const s=document.getElementById('chatScope').value;
  if(s==='hospital'){ const i=document.getElementById('chatHosp').value; if(i!==''){ const h=data[+i];
    return {hint:'Focus on hospital "'+h.name+'" unless the user clearly asks about others. Use get_hospital first.', localFn:q=>localHosp(h,q), title:h.name}; } }
  if(s==='device'){ const i=document.getElementById('chatDev').value; if(i!==''){ const c=CVEDB[+i];
    return {hint:'Focus on the device "'+c.device+'". Use get_device_cve. Include mitigations if not remediated.', localFn:q=>localDevice(q), title:c.device.split(' (')[0]}; } }
  return {hint:'Portfolio-wide question across all hospitals. Use list_hospitals to filter/rank.', localFn:q=>localGlobal(q), title:'Portfolio'};
}
function sendChat(){
  const inp=document.getElementById('chatInput'); const q=(inp.value||'').trim(); if(!q)return; inp.value='';
  addMsg('u',esc(q)); chatMessages.push({role:'user',text:q});
  const sc=currentScope();
  const id=addMsg('a','<span class="mut">\u26A1 answering\u2026</span>',sc.title,false);
  runChat(id,q,sc);
}
async function runChat(bubbleId,question,sc){
  const bubble=document.getElementById(bubbleId);
  const local=sc.localFn(question);
  const setBody=(html,withActions)=>{ bubbleData[bubbleId].html=html;
    bubble.innerHTML=html+(withActions?`<div class="acts"><button onclick="dlPdf('${bubbleId}')">\u21E9 PDF</button><button onclick="emailMsg('${bubbleId}')">\u2709 Email</button></div>`:''); scrollChat(); };
  setBody('<div class="mut" style="font-size:11px;margin-bottom:6px">\u26A1 instant &middot; <span id="'+bubbleId+'_st">checking live agent\u2026</span></div>'+local,true);
  let working=chatMessages.slice(0,-1).map(m=>({role:m.role,content:m.text}));
  working.push({role:'user',content:sc.hint+'\n\n'+question});
  const used=[]; let answered=false;
  try{
    for(let step=0;step<5;step++){
      const ctrl=new AbortController(); const to=setTimeout(()=>ctrl.abort(),10000);
      const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},signal:ctrl.signal,
        body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1200,system:SYS_AGENT,tools:AGENT_TOOLS,messages:working})});
      clearTimeout(to); if(!res.ok)throw new Error('http '+res.status);
      const d=await res.json(); const tu=(d.content||[]).filter(b=>b.type==='tool_use');
      if(d.stop_reason==='tool_use'&&tu.length){ const st=document.getElementById(bubbleId+'_st'); if(st)st.textContent='running '+tu.map(t=>t.name).join(', ')+'\u2026';
        working.push({role:'assistant',content:d.content});
        working.push({role:'user',content:tu.map(t=>{used.push(t.name);return{type:'tool_result',tool_use_id:t.id,content:toolExec(t.name,t.input)};})}); continue; }
      const text=(d.content||[]).map(b=>b.type==='text'?b.text:'').join('').trim();
      if(text){ const trace='<div class="mut" style="font-size:11px;margin-bottom:6px">\u{1F916} agent'+(used.length?' &middot; '+[...new Set(used)].join(', '):'')+'</div>';
        setBody(trace+renderAnswer(text),true); chatMessages.push({role:'assistant',text:text}); answered=true; }
      break;
    }
  }catch(err){ const st=document.getElementById(bubbleId+'_st'); if(st){st.textContent='live agent unavailable — local answer'; } }
  if(!answered)chatMessages.push({role:'assistant',text:htmlToText(local)});
}
// ---- detailed briefings (local, instant; describe incidents & aspects in full) ----
function hospitalBriefing(h){
  const e=exposure(h),r=risk(h),inc=INCIDENTS[h.name];
  let s=`<b>${esc(h.name)}</b><br><span class="mut">${esc(h.city)}, ${esc(h.state)} &middot; ${esc(h.system)} &middot; ${esc(h.type)}${h.beds?' &middot; '+(+h.beds).toLocaleString()+' beds':''}</span><br><br>`;
  s+=`<b>Risk:</b> ${r.score}/100 (${r.band}${r.conf==='inferred'?', inferred':''}). ${esc(r.why)}<br><br>`;
  s+=`<b>Devices:</b> ${(h.vendors||[]).map(esc).join('; ')}<br><br>`;
  if(e.hits&&e.hits.length){ s+='<b>CVE exposure:</b><br>';
    e.hits.forEach(x=>{const c=CVEDB.find(c=>c.device===x.dev); if(c){ s+=`&bull; ${esc(c.device)} — CVSS ${c.maxCvss||'n/a'}, <b>${c.rem}</b>. ${esc(c.remNote||'')}`; if(c.rem!=='likely-remediated'&&c.mitig)s+=`<br>&nbsp;&nbsp;<i>If unpatched:</i> ${esc(c.mitig)}`; s+='<br>'; }}); s+='<br>'; }
  s+='<b>Security incident:</b> '+(inc?`${esc(inc.text)}<br><span class="mut">Source: ${esc(inc.src)}</span>`:'No public incident found in this pass. Verify via the HHS OCR breach portal — absence is not proof of none.')+'<br><br>';
  s+='<b>Recommended posture:</b><br>'+postureAction(h).map(a=>'&bull; '+esc(a)).join('<br>');
  return s;
}
function deviceBriefing(c){
  const carriers=data.filter(h=>(h.vendors||[]).some(v=>c.match.some(m=>v.indexOf(m)>=0)));
  let s=`<b>${esc(c.device)}</b><br><br>`;
  s+=`<b>Max CVSS:</b> ${c.maxCvss!=null?c.maxCvss:'n/a'} &middot; <b>Advisory:</b> ${esc(c.advisory)}<br>`;
  s+=`<b>Key CVEs:</b> ${esc(c.keyCves)}<br>`;
  s+=`<b>Exploitability:</b> ${esc(c.exploit)}<br><br>`;
  s+=`<b>Likely status now:</b> ${esc(c.rem)} — ${esc(c.remNote||'')}<br>`;
  s+=`<b>Vendor remediation:</b> ${esc(c.remediation)} (${esc(c.status)})<br>`;
  if(c.mitig)s+=`<br><b>Mitigations if NOT remediated:</b> ${esc(c.mitig)}<br>`;
  s+=`<br><b>Inferred carriers in this portfolio:</b> ${carriers.length} hospitals (device attribution is mostly inferred — verify).`;
  return s;
}
function htmlToText(h){ return String(h).replace(/<br\s*\/?>/gi,'\n').replace(/<\/p>/gi,'\n\n').replace(/<[^>]+>/g,'')
  .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&middot;/g,'\u00b7').replace(/&mdash;/g,'\u2014')
  .replace(/&rsquo;/g,'\u2019').replace(/&hellip;/g,'\u2026').replace(/&bull;/g,'\u2022').replace(/&nbsp;/g,' ').replace(/&times;/g,'\u00d7')
  .replace(/\n{3,}/g,'\n\n').trim(); }
function dlPdf(id){
  const b=bubbleData[id]; if(!b)return;
  const w=window.open('','_blank'); if(!w){alert('Allow pop-ups to download the PDF.');return;}
  w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>'+esc(b.title)+' — BitSense</title><style>'+
    'body{font:14px Inter,-apple-system,Arial,sans-serif;color:#2c2c2a;max-width:720px;margin:34px auto;line-height:1.6;padding:0 22px}'+
    'h1{color:#1b4965;font-size:20px;margin:0 0 4px}.meta{color:#5f5e5a;font-size:12px;margin-bottom:22px;padding-bottom:12px;border-bottom:2px solid #1b4965}'+
    'b{color:#1b4965}p{margin:0 0 10px}i{color:#5f5e5a}</style></head><body>'+
    '<h1>BitSense — '+esc(b.title)+'</h1><div class="meta">Hospital &amp; Medical-Device Security Tracker &middot; generated '+new Date().toLocaleString()+'</div>'+
    b.html+'<p class="meta" style="border:none;border-top:1px solid #d3d1c7;margin-top:24px;padding-top:10px">Device attributions are largely inferred (market-share / system hypotheses); CVE data is from CISA ICS Medical Advisories. Prioritization signal, not an attestation.</p>'+
    '</body></html>');
  w.document.close(); setTimeout(()=>{try{w.print()}catch(e){}},350);
}
function emailMsg(id){
  const b=bubbleData[id]; if(!b)return;
  let body=htmlToText(b.html).slice(0,1600);
  body+='\n\n\u2014 BitSense Hospital & Medical-Device Security Tracker\nNote: device attributions are largely inferred; CVE data from CISA advisories. Prioritization signal, not attestation.';
  window.location.href='mailto:?subject='+encodeURIComponent('BitSense: '+b.title)+'&body='+encodeURIComponent(body);
}
