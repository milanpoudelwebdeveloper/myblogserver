"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const region = 'us-east-2';
const awsAccessKey = process.env.AWS_ACCESS_KEY;
const awsSecret = process.env.AWS_SECRET;
const awsSender = process.env.EMAIL_SENDER;
const sesConfig = {
    credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecret
    },
    region: region
};
const sesClient = new client_ses_1.SESClient(sesConfig);
const sendEmail = (email, subject, message) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Destination: {
            ToAddresses: [email]
        },
        Message: {
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: message
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: `Hello ${subject}`
            }
        },
        Source: awsSender
    };
    try {
        const command = new client_ses_1.SendEmailCommand(params);
        yield sesClient.send(command);
        return true;
    }
    catch (error) {
        console.log('Error while sending email', error);
        throw new Error('Error while sending email');
    }
});
exports.sendEmail = sendEmail;
//# sourceMappingURL=sendEmail.js.map