const prisma_cloud_alerts = {
    "title":"Alerts Overview",
    "rows":[
       {
          "Policy Name":"AWS EBS volumes are not encrypted deleted on Aug 05, 2021 at 21:35 by template@redlock.io",
          "Alerts":8766,
          "Policy Type":"Config",
          "Severity":"Low",
          "Labels":"PCI DSS v3.2",
          "Compliance Standard":"Prime Therapeutic, ISM - IRAP - Protected [Example}, Copy of CCPA 2018, Copy of GDPR, GDPRのコピー"
       },
       {
          "Policy Name":"AWS EC2 Instance IAM Role not enabled",
          "Alerts":8205,
          "Policy Type":"Config",
          "Severity":"Medium",
          "Labels":"",
          "Compliance Standard":"CIS v1.2.0 (AWS), MITRE ATT&CK v6.3, PIPEDA, CCPA 2018, Backup of ASAE 3150 (Beta), APRA (CPS 234) Information Security, CIS v1.3.0 (AWS), Brazilian Data Protection Law (LGPD), Copy of CCPA 2018, NIST 800-53 Rev 5, Multi-Level Protection Scheme (MLPS) v2.0, NIST 800-53 Rev4, Cybersecurity Maturity Model Certification (CMMC) v.1.02, NIST SP 800-171 Revision 2, ASAE 3150 (Beta), MITRE ATT&CK v8.2, PCI DSS v3.2.1, NIST SP 800-172, HITRUST v.9.4.2, NIST CSF, CSA CCM v.4.0.1, CIS v1.4.0 (AWS)"
       },
       {
          "Policy Name":"GCP VM disks not encrypted with Customer-Supplied Encryption Keys (CSEK)",
          "Alerts":8079,
          "Policy Type":"Config",
          "Severity":"Low",
          "Labels":"",
          "Compliance Standard":"CIS v1.0.0 (GCP), ISO 27001:2013, PIPEDA, CCPA 2018, ASAE 3150 (Beta), APRA (CPS 234) Information Security, CIS v1.1.0 (GCP), NIST 800-53 Rev 5, NIST 800-53 Rev4, Copy of CCPA 2018, Cybersecurity Maturity Model Certification (CMMC) v.1.02, NIST SP 800-171 Revision 2, Backup of ASAE 3150 (Beta), Brazilian Data Protection Law (LGPD), PCI DSS v3.2.1, NIST SP 800-172, CIS v1.2.0 (GCP), Copy of CIS v1.2.0 (GCP), HITRUST v.9.4.2, NIST CSF, CSA CCM v.4.0.1"
       },
       {
          "Policy Name":"List of EC2 Running Instances deleted on Dec 14, 2019 at 8:53 by akristensen@paloaltonetworks.com",
          "Alerts":5004,
          "Policy Type":"Config",
          "Severity":"Low",
          "Labels":"",
          "Compliance Standard":""
       },
       {
          "Policy Name":"Sensitive network configuration updates in AWS deleted on Aug 05, 2021 at 21:35 by template@redlock.io",
          "Alerts":3515,
          "Policy Type":"Audit Event",
          "Severity":"Low",
          "Labels":"CloudTrail",
          "Compliance Standard":"ISM - IRAP - Protected [Example}, ASAE 3150 (Beta), Backup of ASAE 3150 (Beta)"
       },
       {
          "Policy Name":"Sensitive configuration updates deleted on Aug 05, 2021 at 21:35 by template@redlock.io",
          "Alerts":2978,
          "Policy Type":"Audit Event",
          "Severity":"Low",
          "Labels":"",
          "Compliance Standard":"CIS v1.0.0 (GCP), ISO 27001:2013, PIPEDA, CCPA 2018, MITRE ATT&CK v6.3, CIS v1.1.0 (GCP), APRA (CPS 234) Information Security, ASAE 3150 (Beta), Copy of CCPA 2018, Cybersecurity Maturity Model Certification (CMMC) v.1.02, Brazilian Data Protection Law (LGPD), Backup of ASAE 3150 (Beta), MITRE ATT&CK v8.2, NIST SP 800-171 Revision 2, PCI DSS v3.2.1, NIST SP 800-172, CIS v1.2.0 (GCP), Copy of CIS v1.2.0 (GCP), HITRUST v.9.4.2, NIST CSF, CSA CCM v.4.0.1"
       },
       {
          "Policy Name":"GCP VM instances have block project-wide SSH keys feature disabled",
          "Alerts":2325,
          "Policy Type":"Config",
          "Severity":"Medium",
          "Labels":"CloudTrail",
          "Compliance Standard":"ISM - IRAP - Protected [Example}, ASAE 3150 (Beta), Backup of ASAE 3150 (Beta)"
       },
       {
          "Policy Name":"AWS EC2 instances with Public IP and associated with Security Groups have Internet Access",
          "Alerts":1385,
          "Policy Type":"Config",
          "Severity":"Medium",
          "Labels":"",
          "Compliance Standard":"MITRE ATT&CK v6.3, PIPEDA, CCPA 2018, Backup of ASAE 3150 (Beta), Brazilian Data Protection Law (LGPD), Copy of CCPA 2018, NIST 800-53 Rev 5, Multi-Level Protection Scheme (MLPS) v2.0, NIST 800-53 Rev4, APRA (CPS 234) Information Security, Cybersecurity Maturity Model Certification (CMMC) v.1.02, NIST SP 800-171 Revision 2, ASAE 3150 (Beta), MITRE ATT&CK v8.2, PCI DSS v3.2.1, NIST SP 800-172, HITRUST v.9.4.2, NIST CSF, CSA CCM v.4.0.1"
       }
    ]
 }

 export {
   prisma_cloud_alerts
 }