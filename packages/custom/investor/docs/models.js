exports.models = {
    Policy: {
        id: 'Policy',
        required: ['name', 'description', 'mininvestment', 'maxinvestment', 'policyduration', 'policynoticeperiod', 'preclosureconditions', 'autorenewal', 'renewalperiod', 'type', 'fixedrateofinterest', 'riskfactors', 'riskmininterest', 'riskmaxinterest', 'technologyriskfactors', 'coustomdefinedrisks'],
        properties: {
            name: {
                type: 'string',
                description: 'Name of the Policy'
            },
            description: {
                type: 'string',
                description: 'description of the Policy'
            },
            mininvestment: {
                type: 'number',
                description: 'mininvestment of the mininvestment'
            },
            maxinvestment: {
                type: 'number',
                description: 'maxinvestment of the maxinvestment'
            },
            policyduration: {
                type: 'number',
                description: 'policyduration of the policyduration'
            },
            policynoticeperiod: {
                type: 'number',
                description: 'policynoticeperiod of the policy notice period'
            },
            preclosureconditions: {
                type: 'Array',
                description: 'contactDetails of the pre closure conditions',
                properties: {
                    months: {
                        type: 'number',
                        description: 'Number of months to close'
                    },
                    rateofinterest: {
                        type: 'number',
                        description: 'rate of Interest'
                    }
                }
            },
            autorenewal: {
                type: 'boolean',
                description: 'Auto renewal true/false'
            },
            renewalperiod: {
                type: 'number',
                description: 'renewalperiod for policy'
            },
            type: {
                type: 'string',
                description: 'Type of the Policy'
            },
            fixedrateofinterest: {
                type: 'number',
                description: 'fixedrate of interest for policy'
            },
            riskfactors: {
                type: 'Array',
                description: 'riskfactors for policy'
            },
            riskmininterest: {
                type: 'number',
                description: 'risk min interest for policy'
            },
            riskmaxinterest: {
                type: 'number',
                description: 'risk max interest for policy'
            },
            technologyriskfactors: {
                type: 'Array',
                description: 'technology risk factors for policy'
            },
            coustomdefinedrisks: {
                type: 'Array',
                description: 'coustom defined risks for Policy',
                properties: {
                    name: {
                        type: 'number',
                        description: 'name of coustom defined risk'
                    },
                    rateofinterest: {
                        type: 'number',
                        description: 'rate of coustom defined risk'
                    }
                }
            },
        }
    },
    RiskFactor: {
        id: 'RiskFactor',
        required: ['name', 'description', 'technology'],
        properties: {
            name: {
                type: 'string',
                description: 'Name of the RiskFactors'
            },
            description: {
                type: 'string',
                description: 'description of the RiskFactors'
            },
            technology: {
                type: 'boolean',
                description: 'Auto renewal true/false'
            }
        }
    }
};