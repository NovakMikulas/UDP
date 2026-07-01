import LOCATION_MODEL from "../../models/Location.js";

async function locationListInvitationsAbl(userId) {
  return await LOCATION_MODEL.find(
    { "invitations.userId": userId },
    "name address invitations.$",
  ).populate("owner", "username email");
}

export default locationListInvitationsAbl;
