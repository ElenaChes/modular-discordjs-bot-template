module.exports = (commandContext, context) => {
  const { client } = context;

  //[Parse to type]
  function validateBoolean({ arg }) {
    //conversion
    const bool = arg.toLowerCase() === "true" ? true : arg.toLowerCase() === "false" ? false : undefined;
    if (bool === undefined) return undefined;
    //passed validation
    return bool;
  }
  function validateChannel({ opt, arg }) {
    //conversion
    const id = arg.replace(/\D/g, "");
    const channel = client.channels.cache.get(id);
    if (!channel) return undefined;
    //restrictions
    if (opt.channel_types?.length && !opt.channel_types.includes(channel.type)) return undefined;
    //passed validation
    return channel;
  }
  function validateInteger({ opt, arg, fromChoice }) {
    //conversion
    const value = fromChoice ? arg : parseInt(arg, 10);
    if (Number.isNaN(value)) return undefined;
    if (!fromChoice && value.toString() !== arg) return undefined;
    //restrictions
    const { min_value, max_value } = opt;
    if (min_value !== undefined && value < min_value) return undefined;
    if (max_value !== undefined && value > max_value) return undefined;
    //passed validation
    return value;
  }
  function validateMentionable({ arg }) {
    //conversion
    const id = arg.replace(/\D/g, "");
    const entity = client.users.cache.get(id) || commandContext.guild?.roles.cache.get(id);
    if (!entity) return undefined;
    //passed validation
    return entity;
  }
  function validateNumber({ opt, arg }) {
    //conversion
    const value = +arg;
    if (Number.isNaN(value)) return undefined;
    //restrictions
    const { min_value, max_value } = opt;
    if (min_value !== undefined && value < min_value) return undefined;
    if (max_value !== undefined && value > max_value) return undefined;
    //passed validation
    return value;
  }
  function validateRole({ arg }) {
    //conversion
    const id = arg.replace(/\D/g, "");
    const role = commandContext.guild?.roles.cache.get(id);
    if (!role) return undefined;
    //passed validation
    return role;
  }
  function validateString({ opt, arg }) {
    //restrictions
    const { min_length, max_length } = opt;
    if (min_length !== undefined && arg.length < min_length) return undefined;
    if (max_length !== undefined && arg.length > max_length) return undefined;
    //passed validation
    return arg;
  }
  function validateUser({ arg }) {
    //conversion
    const id = arg.replace(/\D/g, "");
    const user = client.users.cache.get(id);
    if (!user) return undefined;
    //passed validation
    return user;
  }

  return {
    validateBoolean,
    validateChannel,
    validateInteger,
    validateMentionable,
    validateNumber,
    validateRole,
    validateString,
    validateUser,
  };
};
