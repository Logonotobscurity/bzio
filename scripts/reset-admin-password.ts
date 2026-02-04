import "dotenv/config";
import { prisma } from "../src/lib/db/index.js";
import * as bcrypt from "bcryptjs";

const ADMIN_EMAIL = "admin@bzion.shop";
const NEW_PASSWORD = "BZion@2026Admin!";

async function resetAdminPassword() {
  try {
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 12);

    const admin = await (prisma as any).user.update({
      where: { email: ADMIN_EMAIL },
      data: {
        password: hashedPassword,
      },
    });

    console.log("✅ Admin password reset successfully!");
    console.log(`Email: ${admin.email}`);
    console.log(`New Password: ${NEW_PASSWORD}`);
    console.log(`\n⚠️  IMPORTANT: Change this password on first login!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting admin password:", error);
    process.exit(1);
  }
}

resetAdminPassword();
