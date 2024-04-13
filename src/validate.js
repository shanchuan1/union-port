const validateMaps = ({ addressMap, interFaceMap }) => {
  // 验证addressMap和interFaceMap的存在性与非空性
  if (!addressMap || !Array.isArray(addressMap) || addressMap.length === 0) {
    throw new Error("addressMap is missing or empty.");
  }

  if (
    !interFaceMap ||
    !Array.isArray(interFaceMap) ||
    interFaceMap.length === 0
  ) {
    throw new Error("interFaceMap is missing or empty.");
  }

  const requiredKeysForAddress = ["appPath", "port"];
  const requiredKeysForInterface = ["interFacePath", "serverIp"];

  // 验证addressMap
  addressMap.forEach((entry) => {
    requiredKeysForAddress.forEach((key) => {
      if (!entry.hasOwnProperty(key) || !entry[key]) {
        throw new Error(`Missing or empty key '${key}' in addressMap`);
      }
    });
  });

  // 验证interFaceMap
  interFaceMap.forEach((entry) => {
    requiredKeysForInterface.forEach((key) => {
      if (!entry.hasOwnProperty(key) || !entry[key]) {
        throw new Error(`Missing or empty key '${key}' in interFaceMap`);
      }
    });
    // 对于serverIp，还可以进一步验证IP地址的有效性，但这取决于具体需求
    // 例如，如果需要确保它是有效的IP地址格式：
    if (!isValidIpAddressWithPort(entry.serverIp)) {
      throw new Error(
        `Invalid IP address format in interFaceMap: ${entry.serverIp}`
      );
    }
  });
};

// 示例IP地址校验函数，真实场景中应使用更严谨的校验方法
const isValidIpAddressWithPort = (ipAndPort) => {
  const ipAddressPattern =
    /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // 分割IP地址和端口
  const [ip, portStr] = ipAndPort.split(":");

  // 验证IP地址部分
  if (!ipAddressPattern.test(ip)) {
    return false;
  }

  // 验证端口部分
  const port = Number.parseInt(portStr, 10);
  if (isNaN(port) || port < 0 || port > 65535) {
    return false;
  }

  return true;
};

module.exports = {
  validateMaps,
  isValidIpAddressWithPort,
};
