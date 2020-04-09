import Email from 'email-templates';

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

const clientInviteEmail = (account_email, token) => {

    const email = new Email({
        message: {
            from: process.env.SMTP_AUTH,
            subject: 'You have been invited to join Booze Boss',
        },
        send: true,
        transport: transporter,
    })

    email
    .send({
        template: 'invite_client',
        message: {
            to: account_email,
        },
        locals: {
            email: account_email,
            signupUrl: `${process.env.SCHEMA}://${process.env.FRONT_HOST}:${process.env.FRONT_PORT}/client-signup?email=${account_email}&token=${token.token}`
        }
    })
    .then(/* console.log */)
    .catch(console.error);
}

const sendFotgotPasswordEmail = (user) => {
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
            resetUrl: `${process.env.SCHEMA}://${process.env.FRONT_HOST}:${process.env.FRONT_PORT}/reset?email=${user.email}&token=${user.password_reset_token}`
        }
    })
    .then(/* console.log */)
    .catch(console.error);
}

export { sendConfirmationEmail, sendFotgotPasswordEmail, clientInviteEmail };