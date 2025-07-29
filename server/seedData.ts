import { storage } from "./storage";

export async function seedDatabase() {
  try {
    console.log("🌱 Seeding database with sample security alerts...");

    // Create a system user for investigations
    const systemUser = await storage.upsertUser({
      id: "system",
      email: "system@soc-portal.local",
      firstName: "System",
      lastName: "Administrator",
      role: "manager"
    });

    // Create sample alerts with realistic security scenarios
    const sampleAlerts = [
      {
        title: "Suspicious PowerShell Execution",
        description: "PowerShell script executed with encoded command line parameters on workstation DESKTOP-ABC123. Command attempted to download files from external domain.",
        severity: "critical" as const,
        source: "DESKTOP-ABC123",
        sourceUser: "john.doe@company.com",
        tags: ["T1059.001", "PowerShell", "Malware"]
      },
      {
        title: "Multiple Failed Login Attempts",
        description: "User account 'admin' experienced 15 failed login attempts from IP address 192.168.1.100 within 5 minutes.",
        severity: "high" as const,
        source: "Domain Controller",
        sourceUser: "admin@company.com",
        tags: ["T1110", "Brute Force", "Authentication"]
      },
      {
        title: "Unusual Network Traffic",
        description: "Workstation LAPTOP-XYZ789 initiated outbound connections to suspicious IP 185.220.101.42 on port 443.",
        severity: "medium" as const,
        source: "LAPTOP-XYZ789",
        sourceUser: "jane.smith@company.com",
        tags: ["T1071", "C2", "Network"]
      },
      {
        title: "Privilege Escalation Attempt",
        description: "Service account 'svc_backup' attempted to access administrative shares without proper authorization.",
        severity: "high" as const,
        source: "File Server FS01",
        sourceUser: "svc_backup@company.com",
        tags: ["T1078", "Privilege Escalation", "Lateral Movement"]
      },
      {
        title: "Suspicious File Download",
        description: "User downloaded executable file 'invoice.exe' from suspicious domain 'temp-files-share[.]net'.",
        severity: "medium" as const,
        source: "Web Proxy",
        sourceUser: "bob.wilson@company.com",
        tags: ["T1566", "Phishing", "Malware"]
      },
      {
        title: "Unauthorized USB Device",
        description: "Unknown USB storage device connected to workstation WORKSTATION-DEF456. Device not in approved hardware list.",
        severity: "low" as const,
        source: "WORKSTATION-DEF456",
        sourceUser: "alice.johnson@company.com",
        tags: ["T1091", "USB", "Data Exfiltration"]
      }
    ];

    // Create alerts with AI analysis
    for (const alertData of sampleAlerts) {
      await storage.createAlert(alertData);
    }

    // Create sample investigation
    await storage.createInvestigation({
      title: "APT Group Investigation - PowerShell Campaign",
      description: "Investigating coordinated PowerShell attacks across multiple workstations. Potential APT group activity detected.",
      priority: "critical",
      assignedTo: null,
      createdBy: "system", // Would be actual user ID in production
    });

    console.log("✅ Database seeded successfully!");
    console.log(`Created ${sampleAlerts.length} sample alerts and 1 investigation`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

// Auto-seed if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}