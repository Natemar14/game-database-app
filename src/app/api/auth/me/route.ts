import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, we would get the user ID from the session
    // For now, we'll return a mock user
    const mockUser = {
      id: 'guest-user',
      username: 'Guest User',
      email: null,
      is_premium: false,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };
    
    return NextResponse.json({ 
      success: true, 
      data: mockUser
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}