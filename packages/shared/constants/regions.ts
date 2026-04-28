export interface CameroonRegion {
  name: string
  cities: string[]
}

export const CAMEROON_REGIONS: CameroonRegion[] = [
  {
    name: 'Adamawa',
    cities: ['Ngaoundéré', 'Meiganga', 'Tibati', 'Banyo'],
  },
  {
    name: 'Centre',
    cities: ['Yaoundé', 'Mbalmayo', 'Obala', 'Bafia', 'Nanga Eboko'],
  },
  {
    name: 'East',
    cities: ['Bertoua', 'Abong-Mbang', 'Batouri', 'Yokadouma'],
  },
  {
    name: 'Far North',
    cities: ['Maroua', 'Kousseri', 'Mora', 'Yagoua', 'Mokolo'],
  },
  {
    name: 'Littoral',
    cities: ['Douala', 'Nkongsamba', 'Edéa', 'Loum'],
  },
  {
    name: 'North',
    cities: ['Garoua', 'Ngong', 'Guider', 'Figuil'],
  },
  {
    name: 'Northwest',
    cities: ['Bamenda', 'Kumbo', 'Wum', 'Ndop'],
  },
  {
    name: 'South',
    cities: ['Ebolowa', 'Kribi', 'Sangmélima', 'Ambam'],
  },
  {
    name: 'Southwest',
    cities: ['Buea', 'Limbe', 'Kumba', 'Mamfe'],
  },
  {
    name: 'West',
    cities: ['Bafoussam', 'Mbouda', 'Dschang', 'Foumban', 'Bangangté'],
  },
]

export const CAMEROON_REGION_NAMES = CAMEROON_REGIONS.map((r) => r.name) as [
  string,
  ...string[],
]
