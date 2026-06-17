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
    const email = 'dummy@example.com';
    const passwordHash = await bcrypt.hash('password123', 10);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role: 'CANDIDATE',
                firstName: 'Dummy',
                lastName: 'User',
                phone: '1234567890',
                isVerified: true,
                candidateProfile: {
                    create: {
                        fullName: 'Dummy User',
                        phone: '1234567890',
                        address: '123 Dummy St, Chennai, Tamil Nadu',
                        summary: 'Experienced developer looking for new opportunities.',
                        expectedSalary: '10 LPA',
                        preferredLocation: 'Chennai',
                        preferredJobType: 'Full Time'
                    }
                }
            }
        });
        console.log('Dummy user created successfully!');
        console.log(`Email: ${user.email}`);
        console.log('Password: password123');
    }
    else {
        console.log('Dummy user already exists!');
        console.log(`Email: ${existingUser.email}`);
        console.log('Password: password123');
    }
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=create-dummy.js.map