import { createClient, type ClientConfig } from '@sanity/client';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
const sanityClientConfig: ClientConfig = {
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    useCdn: process.env.SANITY_USE_CDN === 'true',
    apiVersion: process.env.SANITY_API_VERSION,
    token: process.env.SANITY_SECRET_TOKEN,
}

interface EventProps {
    triggerSource: string,
    userName: string,
    request: {
        userAttributes: {
            email: string,
        }
    }
}

export const lambdaHandler = async (event: EventProps): Promise<any> => {
    try {
        /*
         {
            version: '0',
            callerContext: { awsSdkVersion: '2.1611.0', clientId: '614bnuz0ez47a9wo2ufqw9hbh' },
            region: 'local',
            userPoolId: 'local_1Ebi1XNF',
            triggerSource: 'PostConfirmation_ConfirmSignUp',
            userName: 'example_user8',
            request: {
                userAttributes: {
                sub: 'b7948760-a54c-4145-b921-2a55841782a8',
                email: 'test8@gmail.com',
                'cognito:user_status': 'CONFIRMED'
                }
            },
            response: {}
         }
        */
        if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
            const sanityClient = createClient(sanityClientConfig);

            const doc = {
                _type: 'user',
                email: event.request.userAttributes.email,
            }
              
            await sanityClient.create(doc);

            return event;
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: `some error happened: ${err}`,
            }),
        };
    }
};
