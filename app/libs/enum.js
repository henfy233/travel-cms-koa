function isThisType (val) {
  for (let key in this) {
    if (this[key] === val) {
      return true;
    }
  }
  return false;
}

const ArtType = {
  NOTE: 100,
  GUIDE: 200,
  SCENICE: 300,
  isThisType
};

module.exports = {
  ArtType
};