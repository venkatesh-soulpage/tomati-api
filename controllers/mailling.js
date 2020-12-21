import Email from "email-templates";
import moment from "moment";

const transporter = {
  host:
    process.env.NODE_ENV === "development"
      ? process.env.MAILTRAP_HOST
      : process.env.SMTP_SERVICE,
  port:
    process.env.NODE_ENV === "development" ? process.env.MAILTRAP_PORT : 587,
  secure: false,
  auth: {
    user:
      process.env.NODE_ENV === "development"
        ? process.env.MAILTRAP_USER
        : process.env.SMTP_AUTH,
    pass:
      process.env.NODE_ENV === "development"
        ? process.env.MAILTRAP_PASS
        : process.env.SMTP_PASSWORD,
  },
};

const sendConfirmationEmail = (user, token) => {
  const email = new Email({
    message: {
      from: process.env.SMTP_AUTH,
      subject: "LiquidIntel - Confirm Email",
      /* text: 'Hello ,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + process.env.HOST + ':' + process.env.PORT + '\/confirmation\/' + token.token + '.\n' */
    },
    send: true,
    transport: transporter,
  });

  email
    .send({
      template: "welcome",
      message: {
        to: user.email,
      },
      locals: {
        email: user.email,
        verificationUrl:
          process.env.NODE_ENV === "development"
            ? `${process.env.SCHEMA}://${process.env.HOST}${
                process.env.PORT && `:${process.env.PORT}`
              }/api/auth/confirmation/${token.token}`
            : `${process.env.SCHEMA}://${process.env.HOST}/api/auth/confirmation/${token.token}`,
      },
    })
    .then(/* console.log */)
    .catch(console.error);
};

const organizationInviteEmail = (account_email, token, role, options) => {
  const email = new Email({
    message: {
      from: process.env.SMTP_AUTH,
      subject: "Welcome to LiquidIntel",
    },
    send: true,
    transport: transporter,
  });

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  email
    .send({
      template: "invite_organization",
      message: {
        to: account_email,
      },
      locals: {
        email: options && options.name ? options.name : account_email,
        role: `${capitalizeFirstLetter(role.scope)} ${capitalizeFirstLetter(
          role.name
        )}`,
        signupUrl: `${process.env.SCHEMA}://${process.env.FRONT_HOST}:${process.env.FRONT_PORT}/organization-signup?email=${account_email}&token=${token.token}`,
        custom_message: options && options.custom_message,
        host_name:
          options &&
          options.host &&
          `${options.host.first_name} ${options.host.last_name}`,
        host_sign:
          options &&
          options.host &&
          `- ${options.host.first_name} ${options.host.last_name}`,
      },
    })
    .then(/* console.log */)
    .catch(console.error);
};

const clientInviteEmail = (account_email, token, role, options) => {
  const email = new Email({
    message: {
      from: process.env.SMTP_AUTH,
      subject: "Welcome to LiquidIntel",
    },
    send: true,
    transport: transporter,
  });

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  email
    .send({
      template: "invite_client",
      message: {
        to: account_email,
      },
      locals: {
        email: options && options.name ? options.name : account_email,
        role: `${capitalizeFirstLetter(role.scope)} ${capitalizeFirstLetter(
          role.name
        )}`,
        signupUrl: `${process.env.SCHEMA}://${process.env.FRONT_HOST}:${process.env.FRONT_PORT}/client-signup?email=${account_email}&token=${token.token}`,
        custom_message: options && options.custom_message,
        host_name:
          options &&
          options.host &&
          `${options.host.first_name} ${options.host.last_name}`,
        host_sign:
          options &&
          options.host &&
          `- ${options.host.first_name} ${options.host.last_name}`,
        client_name: options && options.client && options.client.name,
      },
    })
    .then(/* console.log */)
    .catch(console.error);
};

const agencyInviteEmail = (account_email, token, role, options) => {
  const email = new Email({
    message: {
      from: process.env.SMTP_AUTH,
      subject: "Welcome to LiquidIntel",
    },
    send: true,
    transport: transporter,
  });

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  email
    .send({
      template: "invite_agency",
      message: {
        to: account_email,
      },
      locals: {
        email: options && options.name ? options.name : account_email,
        role: `${capitalizeFirstLetter(role.scope)} ${capitalizeFirstLetter(
          role.name
        )}`,
        signupUrl: `${process.env.SCHEMA}://${process.env.FRONT_HOST}:${process.env.FRONT_PORT}/agency-signup?email=${account_email}&token=${token.token}`,
        custom_message: options && options.custom_message,
        host_name:
          options.host &&
          `${options.host.first_name} ${options.host.last_name}`,
        host_sign:
          options.host &&
          `- ${options.host.first_name} ${options.host.last_name}`,
        agency_name:
          options && options && options.agency && options.agency.name,
      },
    })
    .then(/* console.log */)
    .catch(console.error);
};

const sendFotgotPasswordEmail = (user, token) => {
  const email = new Email({
    message: {
      from: process.env.SMTP_AUTH,
      subject: "LiquidIntel - Password reset",
    },
    send: true,
    transport: transporter,
  });

  email
    .send({
      template: "forgot",
      message: {
        to: user.email,
      },
      locals: {
        email: user.email,
        resetUrl: `${process.env.SCHEMA}://${process.env.FRONT_HOST}:${process.env.FRONT_PORT}/reset?email=${user.email}&token=${token}`,
      },
    })
    .then(/* console.log */)
    .catch(console.error);
};

const sendBriefToEmail = (brief, account, status, options) => {
  const email = new Email({
    message: {
      from: process.env.SMTP_AUTH,
      subject: `LiquidIntel - You have a new brief`,
    },
    send: true,
    transport: transporter,
  });

  email
    .send({
      template: "brief",
      message: {
        to: account.email,
      },
      locals: {
        email: account.email,
        account,
        brief,
        moment,
        route: `${process.env.SCHEMA}://${process.env.FRONT_HOST}${
          process.env.FRONT_PORT && `:${process.env.FRONT_PORT}`
        }/briefs`,
        status,
      },
    })
    .then(/* console.log */)
    .catch(console.error);
};

const sendRequisitionToEmail = (requisition, account, status, options) => {
  let subject;

  if (status === "APPROVED")
    subject = `Approval for requisition #${requisition.serial_number}`;
  if (status === "CHANGES REQUIRED")
    subject = `Change requested for requisition #${requisition.serial_number}`;

  const email = new Email({
    message: {
      from: process.env.SMTP_AUTH,
      subject:
        subject || `LiquidIntel - Requisition #${requisition.serial_number}`,
    },
    send: true,
    transport: transporter,
  });

  email
    .send({
      template: "requisition",
      message: {
        to: account.email,
      },
      locals: {
        email: account.email,
        is_approved: status === "APPROVED",
        changes_required: status === "CHANGES REQUIRED",
        account,
        requisition,
        moment,
        route: `${process.env.SCHEMA}://${process.env.FRONT_HOST}${
          process.env.FRONT_PORT && `:${process.env.FRONT_PORT}`
        }/requisitions`,
        status,
        comments: options && options.comments,
      },
    })
    .then(/* console.log */)
    .catch(console.error);
};

const sendDeliveryEmail = (delivery, account, status) => {
  const email = new Email({
    message: {
      from: process.env.SMTP_AUTH,
      subject: `Delivery update for requisition #${delivery.requisition.serial_number}`,
    },
    send: true,
    transport: transporter,
  });

  email
    .send({
      template: "delivery",
      message: {
        to: account.email,
      },
      locals: {
        email: account.email,
        account,
        delivery,
        moment,
        route: `${process.env.SCHEMA}://${process.env.FRONT_HOST}${
          process.env.FRONT_PORT && `:${process.env.FRONT_PORT}`
        }`,
        status,
      },
    })
    .then(/* console.log */)
    .catch(console.error);
};

const sendInviteCode = (guest) => {
  const email = new Email({
    message: {
      from: process.env.SMTP_AUTH,
      subject: "You have been invited to an Event - LiquidIntel",
    },
    send: true,
    transport: transporter,
  });

  email
    .send({
      template: "invite_guest",
      message: {
        to: guest.email,
      },
      locals: {
        guest,
        event: guest.event.brief_event,
        venue: guest.event.brief_event.venue,
        moment,
        signupUrl: `${process.env.SCHEMA}://${process.env.APP_HOST}${
          process.env.APP_PORT && `:${process.env.APP_PORT}`
        }/signup?code=${guest.code}${guest.email && `&email=${guest.email}`}${
          guest.first_name && `&first_name=${guest.first_name}`
        }${guest.last_name && `&last_name=${guest.last_name}`}`,
      },
    })
    .then(/* console.log */)
    .catch(console.error);
};

const outletInviteEmail = (account_email, token, role, options) => {
  const email = new Email({
    message: {
      from: process.env.SMTP_AUTH,
      subject: "Welcome to LiquidIntel",
    },
    send: true,
    transport: transporter,
  });

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  email
    .send({
      template: "invite_outlet",
      message: {
        to: account_email,
      },
      locals: {
        email: options && options.name ? options.name : account_email,
        role: `${capitalizeFirstLetter(role.scope)} ${capitalizeFirstLetter(
          role.name
        )}`,
        signupUrl: `${process.env.SCHEMA}://${process.env.FRONT_HOST}:${process.env.FRONT_PORT}/outlet-signup?email=${account_email}&token=${token.token}`,
        custom_message: options && options.custom_message,
        host_name:
          options &&
          options.host &&
          `${options.host.first_name} ${options.host.last_name}`,
        host_sign:
          options &&
          options.host &&
          `- ${options.host.first_name} ${options.host.last_name}`,
      },
    })
    .then(/* console.log */)
    .catch(console.error);
};

const outletInviteWaiterEmail = (
  account_email,
  token,
  role,
  options,
  outlet_venue,
  outlet_event
) => {
  const email = new Email({
    message: {
      from: process.env.SMTP_AUTH,
      subject: "Welcome to LiquidIntel",
    },
    send: true,
    transport: transporter,
  });

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  email
    .send({
      template: "invite_waiter",
      message: {
        to: account_email,
      },
      locals: {
        email: options && options.name ? options.name : account_email,
        role: `${capitalizeFirstLetter(role.scope)} ${capitalizeFirstLetter(
          role.name
        )}`,
        signupUrl: `${process.env.SCHEMA}://${process.env.FRONT_HOST}:${
          process.env.FRONT_PORT
        }/waiter-signup?email=${account_email}&token=${token.token}&${
          outlet_event
            ? `outlet_event=${outlet_event}`
            : `outlet_venue=${outlet_venue}`
        }`,
        custom_message: options && options.custom_message,
        host_name:
          options &&
          options.host &&
          `${options.host.first_name} ${options.host.last_name}`,
        host_sign:
          options &&
          options.host &&
          `- ${options.host.first_name} ${options.host.last_name}`,
      },
    })
    .then(/* console.log */)
    .catch(console.error);
};

export {
  sendConfirmationEmail,
  sendFotgotPasswordEmail,
  organizationInviteEmail,
  clientInviteEmail,
  agencyInviteEmail,
  sendBriefToEmail,
  sendRequisitionToEmail,
  sendDeliveryEmail,
  sendInviteCode,
  outletInviteEmail,
  outletInviteWaiterEmail,
};
