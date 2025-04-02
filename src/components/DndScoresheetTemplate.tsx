import React, { useState, useEffect } from 'react';

// This component implements the D&D-specific scoresheet template
// with specialized subcategories for character sheets

interface DndCharacterSheet {
  id: string;
  name: string;
  gameId: string;
  subcategories: DndSubcategory[];
}

interface DndSubcategory {
  id: string;
  name: string;
  fields: DndField[];
}

interface DndField {
  id: string;
  name: string;
  type: string;
  defaultValue?: any;
  options?: string[];
  formula?: string;
  min?: number;
  max?: number;
}

const DndScoresheetTemplate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create a pre-configured D&D character sheet template
  const createDndTemplate = async (gameId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Define the D&D character sheet structure with subcategories
      const template: DndCharacterSheet = {
        id: crypto.randomUUID(),
        name: 'D&D 5e Character Sheet',
        gameId,
        subcategories: [
          {
            id: crypto.randomUUID(),
            name: 'Character Information',
            fields: [
              { id: 'character_name', name: 'Character Name', type: 'text', defaultValue: '' },
              { id: 'class', name: 'Class', type: 'text', defaultValue: '' },
              { id: 'race', name: 'Race', type: 'text', defaultValue: '' },
              { id: 'background', name: 'Background', type: 'text', defaultValue: '' },
              { id: 'alignment', name: 'Alignment', type: 'dropdown', 
                options: ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 
                         'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'] },
              { id: 'experience', name: 'Experience Points', type: 'number', defaultValue: 0 },
              { id: 'level', name: 'Level', type: 'number', defaultValue: 1, min: 1, max: 20 }
            ]
          },
          {
            id: crypto.randomUUID(),
            name: 'Ability Scores',
            fields: [
              { id: 'strength', name: 'Strength', type: 'number', defaultValue: 10, min: 1, max: 30 },
              { id: 'dexterity', name: 'Dexterity', type: 'number', defaultValue: 10, min: 1, max: 30 },
              { id: 'constitution', name: 'Constitution', type: 'number', defaultValue: 10, min: 1, max: 30 },
              { id: 'intelligence', name: 'Intelligence', type: 'number', defaultValue: 10, min: 1, max: 30 },
              { id: 'wisdom', name: 'Wisdom', type: 'number', defaultValue: 10, min: 1, max: 30 },
              { id: 'charisma', name: 'Charisma', type: 'number', defaultValue: 10, min: 1, max: 30 },
              { id: 'str_mod', name: 'Strength Modifier', type: 'calculation', 
                formula: 'Math.floor((strength - 10) / 2)' },
              { id: 'dex_mod', name: 'Dexterity Modifier', type: 'calculation', 
                formula: 'Math.floor((dexterity - 10) / 2)' },
              { id: 'con_mod', name: 'Constitution Modifier', type: 'calculation', 
                formula: 'Math.floor((constitution - 10) / 2)' },
              { id: 'int_mod', name: 'Intelligence Modifier', type: 'calculation', 
                formula: 'Math.floor((intelligence - 10) / 2)' },
              { id: 'wis_mod', name: 'Wisdom Modifier', type: 'calculation', 
                formula: 'Math.floor((wisdom - 10) / 2)' },
              { id: 'cha_mod', name: 'Charisma Modifier', type: 'calculation', 
                formula: 'Math.floor((charisma - 10) / 2)' }
            ]
          },
          {
            id: crypto.randomUUID(),
            name: 'Combat Stats',
            fields: [
              { id: 'armor_class', name: 'Armor Class', type: 'number', defaultValue: 10 },
              { id: 'initiative', name: 'Initiative', type: 'calculation', formula: 'dex_mod' },
              { id: 'speed', name: 'Speed', type: 'number', defaultValue: 30 },
              { id: 'hit_point_max', name: 'Hit Point Maximum', type: 'number', defaultValue: 10 },
              { id: 'current_hit_points', name: 'Current Hit Points', type: 'number', defaultValue: 10 },
              { id: 'temporary_hit_points', name: 'Temporary Hit Points', type: 'number', defaultValue: 0 },
              { id: 'hit_dice', name: 'Hit Dice', type: 'text', defaultValue: '1d8' }
            ]
          },
          {
            id: crypto.randomUUID(),
            name: 'Skills',
            fields: [
              { id: 'acrobatics', name: 'Acrobatics (Dex)', type: 'calculation', formula: 'dex_mod' },
              { id: 'animal_handling', name: 'Animal Handling (Wis)', type: 'calculation', formula: 'wis_mod' },
              { id: 'arcana', name: 'Arcana (Int)', type: 'calculation', formula: 'int_mod' },
              { id: 'athletics', name: 'Athletics (Str)', type: 'calculation', formula: 'str_mod' },
              { id: 'deception', name: 'Deception (Cha)', type: 'calculation', formula: 'cha_mod' },
              { id: 'history', name: 'History (Int)', type: 'calculation', formula: 'int_mod' },
              { id: 'insight', name: 'Insight (Wis)', type: 'calculation', formula: 'wis_mod' },
              { id: 'intimidation', name: 'Intimidation (Cha)', type: 'calculation', formula: 'cha_mod' },
              { id: 'investigation', name: 'Investigation (Int)', type: 'calculation', formula: 'int_mod' },
              { id: 'medicine', name: 'Medicine (Wis)', type: 'calculation', formula: 'wis_mod' },
              { id: 'nature', name: 'Nature (Int)', type: 'calculation', formula: 'int_mod' },
              { id: 'perception', name: 'Perception (Wis)', type: 'calculation', formula: 'wis_mod' },
              { id: 'performance', name: 'Performance (Cha)', type: 'calculation', formula: 'cha_mod' },
              { id: 'persuasion', name: 'Persuasion (Cha)', type: 'calculation', formula: 'cha_mod' },
              { id: 'religion', name: 'Religion (Int)', type: 'calculation', formula: 'int_mod' },
              { id: 'sleight_of_hand', name: 'Sleight of Hand (Dex)', type: 'calculation', formula: 'dex_mod' },
              { id: 'stealth', name: 'Stealth (Dex)', type: 'calculation', formula: 'dex_mod' },
              { id: 'survival', name: 'Survival (Wis)', type: 'calculation', formula: 'wis_mod' }
            ]
          },
          {
            id: crypto.randomUUID(),
            name: 'Equipment',
            fields: [
              { id: 'copper', name: 'Copper (CP)', type: 'number', defaultValue: 0 },
              { id: 'silver', name: 'Silver (SP)', type: 'number', defaultValue: 0 },
              { id: 'electrum', name: 'Electrum (EP)', type: 'number', defaultValue: 0 },
              { id: 'gold', name: 'Gold (GP)', type: 'number', defaultValue: 0 },
              { id: 'platinum', name: 'Platinum (PP)', type: 'number', defaultValue: 0 },
              { id: 'equipment_list', name: 'Equipment List', type: 'text', defaultValue: '' }
            ]
          },
          {
            id: crypto.randomUUID(),
            name: 'Features & Traits',
            fields: [
              { id: 'features', name: 'Features & Traits', type: 'text', defaultValue: '' },
              { id: 'proficiencies', name: 'Proficiencies', type: 'text', defaultValue: '' },
              { id: 'languages', name: 'Languages', type: 'text', defaultValue: '' }
            ]
          },
          {
            id: crypto.randomUUID(),
            name: 'Spellcasting',
            fields: [
              { id: 'spellcasting_class', name: 'Spellcasting Class', type: 'text', defaultValue: '' },
              { id: 'spellcasting_ability', name: 'Spellcasting Ability', type: 'dropdown', 
                options: ['Intelligence', 'Wisdom', 'Charisma'] },
              { id: 'spell_save_dc', name: 'Spell Save DC', type: 'number', defaultValue: 8 },
              { id: 'spell_attack_bonus', name: 'Spell Attack Bonus', type: 'number', defaultValue: 0 },
              { id: 'cantrips', name: 'Cantrips', type: 'text', defaultValue: '' },
              { id: 'level1_slots', name: 'Level 1 Slots', type: 'number', defaultValue: 0, min: 0, max: 4 },
              { id: 'level2_slots', name: 'Level 2 Slots', type: 'number', defaultValue: 0, min: 0, max: 3 },
              { id: 'level3_slots', name: 'Level 3 Slots', type: 'number', defaultValue: 0, min: 0, max: 3 },
              { id: 'level4_slots', name: 'Level 4 Slots', type: 'number', defaultValue: 0, min: 0, max: 3 },
              { id: 'level5_slots', name: 'Level 5 Slots', type: 'number', defaultValue: 0, min: 0, max: 3 },
              { id: 'level6_slots', name: 'Level 6 Slots', type: 'number', defaultValue: 0, min: 0, max: 2 },
              { id: 'level7_slots', name: 'Level 7 Slots', type: 'number', defaultValue: 0, min: 0, max: 2 },
              { id: 'level8_slots', name: 'Level 8 Slots', type: 'number', defaultValue: 0, min: 0, max: 1 },
              { id: 'level9_slots', name: 'Level 9 Slots', type: 'number', defaultValue: 0, min: 0, max: 1 }
            ]
          }
        ]
      };
      
      // In a real implementation, this would be an API call
      const response = await fetch('/api/scoresheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to create D&D template');
      }
      
      return data.success ? data.data : null;
    } catch (err) {
      setError('Error creating D&D template');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    createDndTemplate,
    loading,
    error
  };
};

export default DndScoresheetTemplate;
