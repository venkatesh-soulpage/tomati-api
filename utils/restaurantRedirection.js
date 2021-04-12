const getPage = (schema, site, venue_id) => {
  return `<!DOCTYPE html>
    <html>
      <head>
        <meta
          http-equiv="refresh"
          content="0; url='${schema}://${site}/outlet?outlet_venue=${venue_id}'"
        />
        <link
          href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
          rel="stylesheet"
          integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN"
          crossorigin="anonymous"
        />
        <style>
          .spinner {
            position: fixed;
            z-index: 1031;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 35;
          }
          .size {
            font-size: 50px;
            color: #e0475b;
          }
        </style>
      </head>
      <body>
        <div class="spinner"><i class="fa fa-spinner fa-spin size"></i></div>
      </body>
    </html>`;
};

module.exports = getPage;
