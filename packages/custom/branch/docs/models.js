exports.models = {

		Country: {
        id: 'Country',
        required: ['countryName', 'countryCode','currency','languageName','languageCode'],
        properties: {

        	countryName: {
                type: 'string',
                description: 'countryName of the country'
            },
            countryCode: {
                type: 'string',
                description: 'countryCode of the country'
            },
            currency: {
                type: 'string',
                description: 'currency of the country'
            },
            languageName: {
                type: 'string',
                description: 'languageName of the country'
            },
            languageCode: {
                type: 'string',
                description: 'languageCode of the country'
            }
        }
    },
    Zone: {
        id: 'Zone',
        required: ['zoneName', 'zoneCode'],
        properties: {

        	zoneName: {
                type: 'string',
                description: 'zoneName of the zone'
            },
            zoneCode: {
                type: 'string',
                description: 'zoneCode of the zone'
            }
        }
    },
    City: {
        id: 'City',
        required: ['cityName', 'cityCode'],
        properties: {

        	cityName: {
                type: 'string',
                description: 'cityName of the city'
            },
            cityCode: {
                type: 'string',
                description: 'cityCode of the city'
            }
        }
    },
    Zone: {
        id: 'Zone',
        required: ['zoneName', 'zoneCode'],
        properties: {

        	zoneName: {
                type: 'string',
                description: 'zoneName of the zone'
            },
            zoneCode: {
                type: 'string',
                description: 'zoneCode of the zone'
            }
        }
    },
    Branch: {
        id: 'Branch',
        required: ['branchName', 'branchCode'],
        properties: {

        	branchName: {
                type: 'string',
                description: 'branchName of the Branch'
            },
            branchCode: {
                type: 'string',
                description: 'branchCode of the Branch'
            }
        }
    },
    

};
