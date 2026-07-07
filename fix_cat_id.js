const fs = require('fs');
let c = fs.readFileSync('frontend/src/app/api/categories/[id]/route.ts', 'utf8');

if (!c.includes("import { verifyAuth } from '@/lib/auth';")) {
  c = c.replace(/import \{ prisma \} from '@\/lib\/prisma';/, "import { prisma } from '@/lib/prisma';\nimport { verifyAuth } from '@/lib/auth';");
}

c = c.replace(/export async function PUT\(req: NextRequest, \{ params \}: \{ params: Promise<\{ id: string \}> \}\) \{\n  try \{/, 
`export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {\n  try {\n    const { user, error } = await verifyAuth(req);\n    if (error || !user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });`);

c = c.replace(/export async function DELETE\(req: NextRequest, \{ params \}: \{ params: Promise<\{ id: string \}> \}\) \{\n  try \{/,
`export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {\n  try {\n    const { user, error } = await verifyAuth(req);\n    if (error || !user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });`);

fs.writeFileSync('frontend/src/app/api/categories/[id]/route.ts', c);
