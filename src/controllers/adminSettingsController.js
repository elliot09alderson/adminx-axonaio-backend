import WhiteListApiModel from "../models/whiteListApiModel.js";
import WhiteListDomainModel from "../models/WhiteListDomainModel.js";

// _________________________create WhiteList API______________________

export async function createApiWhiteList(req, res, next) {
  const { ip } = req.body;
  if (!ip) {
    return res.status(400).json({
      status: false,
      message: "Please Provide Ip ",
    });
  }
  const savedIp = await WhiteListApiModel.create({
    ip,
    added_By: req.user._id,
  });

  if (savedIp) {
    return res.status(200).json({
      status: true,
      data: savedIp,
      message: "Ip whitelisted successfully ",
    });
  }
  return res.status(200).json({
    status: false,
    message: "some error occured while whilisting " + ip,
  });
}

// ________________delete WhiteList IP ______________________
export async function deleteApiWhiteListIp(req, res, next) {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({
      status: false,
      message: "invalid input ",
    });
  }
  const deleted = await WhiteListApiModel.findByIdAndDelete({
    _id: id,
  });
  console.log(deleted);

  if (deleted) {
    return res.status(200).json({
      status: true,
      data: id,
      message: "Ip deleted successfully ",
    });
  }
  return res.status(200).json({
    status: false,
    message: "some error occured while deleting whitelist ip ",
  });
}
// __________________delete Whitelisted domain ______________________
export async function deleteWhiteListDomain(req, res, next) {
  const { id } = req.body;
  console.log(id);

  if (!id) {
    return res.status(400).json({
      status: false,
      message: "invalid input ",
    });
  }
  const deleted = await WhiteListDomainModel.findByIdAndDelete({
    _id: id,
  });

  if (deleted) {
    return res.status(200).json({
      status: true,
      data: id,
      message: "Domain deleted successfully ",
    });
  }
  console.log(deleted);
  return res.status(200).json({
    status: false,
    message: "some error occured while deleting whitelist domain ",
  });
}

// _________________________WhiteList DOMAIN ______________________

export async function createDomainWhitelist(req, res, next) {
  const { domain } = req.body;
  if (!domain) {
    return res.status(400).json({
      status: false,
      message: "Please Provide domain ",
    });
  }
  const savedDomain = await WhiteListDomainModel.create({
    domain,
    added_By: req.user._id,
  });

  if (savedDomain) {
    return res.status(200).json({
      data: savedDomain,
      status: true,
      message: "Domain whitelisted successfully ",
    });
  }
  return res.status(200).json({
    status: false,
    message: "some error occured while whilisting " + domain,
  });
}
// _________________________GET DOMAINS______________________
export async function getDomainWhitelist(req, res, next) {
  const savedDomains = await WhiteListDomainModel.find();

  if (savedDomains.length > 0) {
    return res.status(200).json({
      status: true,
      data: savedDomains,
    });
  }
  return res.status(404).json({
    status: false,
    message: "No whitelist Domains found",
    data: savedDomains,
  });
}
// _________________________GET IP's______________________
export async function getApiWhitelistIp(req, res, next) {
  const savedip = await WhiteListApiModel.find();

  if (savedip.length > 0) {
    return res.status(200).json({
      status: true,
      data: savedip,
    });
  }
  return res.status(404).json({
    status: false,
    data: savedip,
    message: "No whitelist ip's found",
  });
}
