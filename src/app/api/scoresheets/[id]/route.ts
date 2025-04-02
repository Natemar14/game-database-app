import { NextRequest, NextResponse } from 'next/server';

// This file implements the advanced scoresheet system with subcategories
// as requested by the user, particularly for complex games like D&D

export interface ScoresheetSubcategory {
  id: string;
  name: string;
  fields: ScoresheetField[];
}

export interface ScoresheetField {
  id: string;
  name: string;
  type: 'number' | 'text' | 'checkbox' | 'dropdown' | 'calculation';
  defaultValue?: any;
  options?: string[]; // For dropdown type
  formula?: string; // For calculation type
  min?: number; // For number type
  max?: number; // For number type
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scoresheetId = params.id;
    
    // Get scoresheet
    const scoresheet = await DB.prepare(
      'SELECT * FROM scoresheets WHERE id = ?'
    ).bind(scoresheetId).first();
    
    if (!scoresheet) {
      return NextResponse.json(
        { success: false, error: 'Scoresheet not found' },
        { status: 404 }
      );
    }
    
    // Get subcategories
    const subcategories = await DB.prepare(
      'SELECT * FROM scoresheet_subcategories WHERE scoresheet_id = ? ORDER BY display_order'
    ).bind(scoresheetId).all();
    
    // Get fields for each subcategory
    const subcategoriesWithFields = await Promise.all(
      subcategories.results.map(async (subcategory: any) => {
        const fields = await DB.prepare(
          'SELECT * FROM scoresheet_fields WHERE subcategory_id = ? ORDER BY display_order'
        ).bind(subcategory.id).all();
        
        return {
          ...subcategory,
          fields: fields.results
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      data: {
        ...scoresheet,
        subcategories: subcategoriesWithFields
      }
    });
  } catch (error) {
    console.error(`Error fetching scoresheet ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scoresheet' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scoresheetId = params.id;
    const body = await request.json();
    
    // Check if scoresheet exists
    const scoresheet = await DB.prepare(
      'SELECT * FROM scoresheets WHERE id = ?'
    ).bind(scoresheetId).first();
    
    if (!scoresheet) {
      return NextResponse.json(
        { success: false, error: 'Scoresheet not found' },
        { status: 404 }
      );
    }
    
    // Update scoresheet
    await DB.prepare(
      'UPDATE scoresheets SET name = ? WHERE id = ?'
    ).bind(body.name || scoresheet.name, scoresheetId).run();
    
    // Handle subcategories if provided
    if (body.subcategories && Array.isArray(body.subcategories)) {
      // First, delete existing subcategories and fields
      // In a real implementation, we might want to update instead of delete/recreate
      await DB.prepare(
        'DELETE FROM scoresheet_fields WHERE subcategory_id IN (SELECT id FROM scoresheet_subcategories WHERE scoresheet_id = ?)'
      ).bind(scoresheetId).run();
      
      await DB.prepare(
        'DELETE FROM scoresheet_subcategories WHERE scoresheet_id = ?'
      ).bind(scoresheetId).run();
      
      // Then create new subcategories and fields
      for (let i = 0; i < body.subcategories.length; i++) {
        const subcategory = body.subcategories[i];
        const subcategoryId = crypto.randomUUID();
        
        await DB.prepare(
          `INSERT INTO scoresheet_subcategories (id, scoresheet_id, name, display_order) 
           VALUES (?, ?, ?, ?)`
        ).bind(
          subcategoryId,
          scoresheetId,
          subcategory.name,
          i
        ).run();
        
        // Create fields for this subcategory
        if (subcategory.fields && Array.isArray(subcategory.fields)) {
          for (let j = 0; j < subcategory.fields.length; j++) {
            const field = subcategory.fields[j];
            const fieldId = crypto.randomUUID();
            
            await DB.prepare(
              `INSERT INTO scoresheet_fields (id, subcategory_id, name, type, default_value, options, formula, min_value, max_value, display_order) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(
              fieldId,
              subcategoryId,
              field.name,
              field.type,
              field.defaultValue || null,
              field.options ? JSON.stringify(field.options) : null,
              field.formula || null,
              field.min || null,
              field.max || null,
              j
            ).run();
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Scoresheet updated successfully'
    });
  } catch (error) {
    console.error(`Error updating scoresheet ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update scoresheet' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scoresheetId = params.id;
    
    // Check if scoresheet exists
    const scoresheet = await DB.prepare(
      'SELECT * FROM scoresheets WHERE id = ?'
    ).bind(scoresheetId).first();
    
    if (!scoresheet) {
      return NextResponse.json(
        { success: false, error: 'Scoresheet not found' },
        { status: 404 }
      );
    }
    
    // Delete fields and subcategories first
    await DB.prepare(
      'DELETE FROM scoresheet_fields WHERE subcategory_id IN (SELECT id FROM scoresheet_subcategories WHERE scoresheet_id = ?)'
    ).bind(scoresheetId).run();
    
    await DB.prepare(
      'DELETE FROM scoresheet_subcategories WHERE scoresheet_id = ?'
    ).bind(scoresheetId).run();
    
    // Delete scoresheet
    await DB.prepare(
      'DELETE FROM scoresheets WHERE id = ?'
    ).bind(scoresheetId).run();
    
    return NextResponse.json({
      success: true,
      message: 'Scoresheet deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting scoresheet ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete scoresheet' },
      { status: 500 }
    );
  }
}
