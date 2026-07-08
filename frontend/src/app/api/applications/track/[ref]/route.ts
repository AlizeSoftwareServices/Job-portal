import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const unwrappedParams = await params;
    const ref = unwrappedParams.ref;

    if (!ref) {
      return NextResponse.json({ message: 'Reference number required' }, { status: 400 });
    }

    // Clean the input to handle both "REF-XYZ" and "XYZ"
    const cleanRef = ref.toUpperCase().replace(/^REF-/, '').trim();
    const formattedRef = `REF-${cleanRef}`;

    const application = await prisma.application.findFirst({
      where: {
        OR: [
          { referenceNumber: ref },
          { referenceNumber: cleanRef },
          { referenceNumber: formattedRef },
        ]
      },
      include: {
        job: {
          select: {
            title: true,
            jobCode: true
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json({ message: 'Application not found. Please check your reference number.' }, { status: 404 });
    }

    return NextResponse.json(application, { status: 200 });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
