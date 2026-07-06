"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const passwordHash = await bcrypt.hash('Demo@123', 10);
    const candidate = await prisma.user.upsert({
        where: { email: 'candidate@demo.com' },
        update: {},
        create: {
            email: 'candidate@demo.com',
            passwordHash,
            role: 'CANDIDATE',
            firstName: 'Demo',
            lastName: 'Candidate',
            phone: '1234567890',
            isVerified: true,
            candidateProfile: {
                create: {
                    fullName: 'Demo Candidate',
                    phone: '1234567890'
                }
            }
        }
    });
    const employer = await prisma.user.upsert({
        where: { email: 'employer@demo.com' },
        update: {},
        create: {
            email: 'employer@demo.com',
            passwordHash,
            role: 'EMPLOYER',
            firstName: 'Demo',
            lastName: 'Employer',
            phone: '9876543210',
            isVerified: true,
            employerProfile: {
                create: {
                    companyName: 'Demo Corp',
                    companyWebsite: 'https://demo.com',
                    hrName: 'Demo Employer',
                    industry: 'IT'
                }
            }
        }
    });
    console.log('Seed successful! Credentials:');
    console.log('Candidate: candidate@demo.com / Demo@123');
    console.log('Employer: employer@demo.com / Demo@123');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map