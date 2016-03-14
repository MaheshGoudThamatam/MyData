exports.models = {

  Skill: {
    id: 'Skill',
    required: ['name','description','keywords'],
    properties: {
   
    	name: {
        type: 'string',
        description: 'Name for a skill'
      },

      description: {
      type: 'string',
      description: 'Description for a skill'
    },
      keywords: {
        type: 'Array',
        description: 'Keywords associated for a skill'
      }
    }
  },
   
  /**
   * Badge 
   * */
   
Badge: {
    id: 'Badge',
    required: ['badgeName','description','qualifySkills','qualifyPoints'],
    properties: {
   
    	badgeName: {
        type: 'string',
        description: 'Name for a badge'
      },
         description: {
         type: 'string',
         description: 'Description for a badge'
      },
      qualifyPoints: {
        type: 'string',
        description: 'qualifyPoints for a badge'
      },
      qualifySkills: {
          type: 'string',
          description: 'qualifySkills for a badge'
        }
    }
  }
};
