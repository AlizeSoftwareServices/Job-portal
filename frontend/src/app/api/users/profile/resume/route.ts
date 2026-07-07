import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ message: 'File is required' }, { status: 400 });

    const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedMimeTypes.includes(file.type)) return NextResponse.json({ message: 'Only PDF and DOCX files are allowed' }, { status: 400 });
    if (file.size > 100 * 1024) return NextResponse.json({ message: 'Max 100KB' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const isPdf = file.type === 'application/pdf';
    const result = await uploadToCloudinary(buffer, 'job_portal_resumes', isPdf);

    return NextResponse.json({ resumeUrl: result.secure_url }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
