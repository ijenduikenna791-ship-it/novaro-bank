// Royalty-free photos from Pexels (https://www.pexels.com/license/)
const px = (id, w = 1200, extra = '') =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}${extra}`;

export const avatars = [774909, 220453, 1239291, 1222271].map((id) => px(id, 120, '&h=120&fit=crop'));

export const photos = {
  phoneAndCard: px(7534791, 1400),     // man paying online with phone + card
  cashless: px(6969809, 1400),         // cashless transaction at a table
  cardBehindPhone: px(7621358, 1200),  // card behind smartphone
  womanPaying: px(6969739, 1200),      // woman paying with phone
};
