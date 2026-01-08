import { Project, WorkCategory, WorkStatus, UnitType } from '../types';

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Downtown Highrise',
    areas: [
      {
        id: 'area-1',
        name: 'First Floor - Lobby',
        workItems: [
          {
            id: 'item-1', name: 'Marble Flooring', category: WorkCategory.INTERIOR,
            subWorks: [{id: 'sw-1', name: 'Grinding', isCompleted: true}, {id: 'sw-2', name: 'Polishing', isCompleted: false}],
            designPreference: 'Italian Statuario marble', color: 'White with grey veins',
            length: 100, width: 50, depth: 0, units: 0, unitType: UnitType.SQFT, quantity: 5000,
            status: WorkStatus.IN_PROGRESS
          }
        ]
      },
      {
        id: 'area-2',
        name: 'Second Floor - Office Space',
        workItems: [
            {
                id: 'item-2', name: 'Electrical Wiring', category: WorkCategory.ELECTRICAL,
                subWorks: [{id: 'sw-3', name: 'Conduit laying', isCompleted: true}, {id: 'sw-4', name: 'Wire pulling', isCompleted: true}],
                designPreference: 'Standard copper wiring', color: 'N/A',
                length: 500, width: 0, depth: 0, units: 0, unitType: UnitType.RUNNING_METER, quantity: 500,
                status: WorkStatus.COMPLETED
            },
            {
                id: 'item-3', name: 'Drywall Installation', category: WorkCategory.CIVIL,
                subWorks: [],
                designPreference: 'Fire-rated gypsum board', color: 'Off-white',
                length: 200, width: 8, depth: 0, units: 0, unitType: UnitType.SQFT, quantity: 1600,
                status: WorkStatus.PENDING
            }
        ]
      }
    ]
  }
];
