// /src/adapters/destinations-adapter.js

export default class DestinationsAdapter {
  static adaptToClient(destinations) {
    return destinations.map((destination) => ({
      id: destination.id,
      name: destination.name,
      description: destination.description,
      pictures: destination.pictures.map((picture) => ({
        src: picture.src,
        description: picture.description,
      }))
    }));
  }
}
