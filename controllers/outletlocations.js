import models from "../models";

const getLocations = async (req, res, next) => {
  try {
    // Get locations
    const locations = await models.Location.query()
      .withGraphFetched(
        `[
      childrens
  ]`
      )
      .where("is_country", true)
      .orderBy("name", "asc");

    // Send the clientss
    return res.status(200).send(locations);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const locationsController = {
  getLocations,
};

export default locationsController;
