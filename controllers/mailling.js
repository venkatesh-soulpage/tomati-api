import Email from 'email-templates';
import moment from 'moment';

const transporter = {
    host: process.env.NODE_ENV === 'development' ? process.env.MAILTRAP_HOST : process.env.SMTP_SERVICE,
    port: process.env.NODE_ENV === 'development' ? process.env.MAILTRAP_PORT : 587,
    secure: false,
    auth: {
        user: process.env.NODE_ENV === 'development' ? process.env.MAILTRAP_USER : process.env.SMTP_AUTH,
        pass: process.env.NODE_ENV === 'development' ? process.env.MAILTRAP_PASS : process.env.SMTP_PASSWORD,
    }
};

const sendConfirmationEmail = (user, token) => {

    const email = new Email({
        message: {
            from: process.env.SMTP_AUTH,
            subject: 'Booze Boss - Confirm Email',
            /* text: 'Hello ,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + process.env.HOST + ':' + process.env.PORT + '\/confirmation\/' + token.token + '.\n' */
        },
        send: true,
        transport: transporter,
    })

    email
    .send({
        template: 'welcome',
        message: {
            to: user.email,
        },
        locals: {
            email: user.email,
            verificationUrl: process.env.NODE_ENV === 'development' ? 
                `${process.env.SCHEMA}://${process.env.HOST}${process.env.PORT && `:${process.env.PORT}`}/api/auth/confirmation/${token.token}` :
                `${process.env.SCHEMA}://${process.env.HOST}/api/auth/confirmation/${token.token}`
        }
    })
    .then(/* console.log */)
    .catch(console.error);
}

const clientInviteEmail = (account_email, token, role) => {

    const email = new Email({
        message: {
            from: process.env.SMTP_AUTH,
            subject: 'You have been invited to join Booze Boss',
        },
        send: true,
        transport: transporter,
    })

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    email
    .send({
        template: 'invite_client',
        message: {
            to: account_email,
        },
        locals: {
            email: account_email,
            role: `${capitalizeFirstLetter(role.scope)} ${capitalizeFirstLetter(role.name)}`,
            signupUrl: `${process.env.SCHEMA}://${process.env.FRONT_HOST}:${process.env.FRONT_PORT}/client-signup?email=${account_email}&token=${token.token}`
        }
    })
    .then(/* console.log */)
    .catch(console.error);
}

const agencyInviteEmail = (account_email, token, role) => {

    const email = new Email({
        message: {
            from: process.env.SMTP_AUTH,
            subject: 'You have been invited to join Booze Boss',
        },
        send: true,
        transport: transporter,
    })

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    email
    .send({
        template: 'invite_agency',
        message: {
            to: account_email,
        },
        locals: {
            email: account_email,
            role: `${capitalizeFirstLetter(role.scope)} ${capitalizeFirstLetter(role.name)}`, 
            signupUrl: `${process.env.SCHEMA}://${process.env.FRONT_HOST}:${process.env.FRONT_PORT}/agency-signup?email=${account_email}&token=${token.token}`
        }
    })
    .then(/* console.log */)
    .catch(console.error);
}

const sendFotgotPasswordEmail = (user, token) => {
    const email = new Email({
        message: {
            from: process.env.SMTP_AUTH,
            subject: 'Booze Boss - Reset Password',
        },
        send: true,
        transport: transporter,
    })

    email
    .send({
        template: 'forgot',
        message: {
            to: user.email,
        },
        locals: {
            email: user.email,
            resetUrl: `${process.env.SCHEMA}://${process.env.FRONT_HOST}:${process.env.FRONT_PORT}/reset?email=${user.email}&token=${token}`
        }
    })
    .then(/* console.log */)
    .catch(console.error);
}

const sendRequisitionToEmail = (requisition, account, status) => {
    const email = new Email({
        message: {
            from: process.env.SMTP_AUTH,
            subject: `Booze Boss - Requisition (${requisition.serial_number})`,
        },
        send: true,
        transport: transporter,
    })

    email
    .send({
        template: 'approve_requisition',
        message: {
            to: account.email,
        },
        locals: {
            email: account.email,
            account,
            requisition,
            moment,
            route: `${process.env.SCHEMA}://${process.env.FRONT_HOST}${process.env.FRONT_PORT  && `:${process.env.FRONT_PORT}`}/requisitions`,
            status,
        }
    })
    .then(/* console.log */)
    .catch(console.error);
}

const sendDeliveryEmail = (delivery, account, status) => {
    const email = new Email({
        message: {
            from: process.env.SMTP_AUTH,
            subject: 'Booze Boss - You have a delivery update',
        },
        send: true,
        transport: transporter,
    })

    email
    .send({
        template: 'delivery',
        message: {
            to: account.email,
        },
        locals: {
            email: account.email,
            account,
            delivery,
            moment,
            route: `${process.env.SCHEMA}://${process.env.FRONT_HOST}${process.env.FRONT_PORT  && `:${process.env.FRONT_PORT}`}`,
            status,
        }
    })
    .then(/* console.log */)
    .catch(console.error);
}

const sendInviteCode = (guest) => {
    const email = new Email({
        message: {
            from: process.env.SMTP_AUTH,
            subject: 'You have been invited to an Event - Booze Boss',
        },
        send: true,
        transport: transporter,
    })

    email
    .send({
        template: 'invite_guest',
        message: {
            to: guest.email,
        },
        locals: {
            guest,
            event: guest.event[0].brief_event,
            venue: guest.event[0].brief_event.venue,
            moment,
            signupUrl: `${process.env.SCHEMA}://${process.env.APP_HOST}${process.env.APP_PORT  && `:${process.env.APP_PORT}`}/signup?code=${guest.code}${guest.email && `&email=${guest.email}`}${guest.first_name && `&first_name=${guest.first_name}`}${guest.last_name && `&last_name=${guest.last_name}`}`,
        }
    })
    .then(/* console.log */)
    .catch(console.error);
}

export { 
    sendConfirmationEmail,
    sendFotgotPasswordEmail,
    clientInviteEmail,
    agencyInviteEmail,
    sendRequisitionToEmail,
    sendDeliveryEmail,
    sendInviteCode
};