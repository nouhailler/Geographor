// Données éditoriales curées — Géographie de France.
// Ces contenus (textes régionaux, métriques thématiques, fiches départementales détaillées,
// géographie physique) n'ont pas d'API libre fournissant une version structurée équivalente.
// Sources indicatives : INSEE (pop. légales 2021), IGN, RTE. Valeurs arrondies, à titre indicatif.
// Les données administratives « vivantes » (listes, populations communales, contours) viennent, elles,
// de geo.api.gouv.fr ; les médias de Wikidata/Commons ; l'historique communal de Wikipédia.

import type {
  RegionEditorial,
  DepFiche,
  MetricData,
  MetricKey,
  Fleuve,
  Sommet,
  Parc,
  Lac,
  Ville,
  Poi,
} from '../types'

export const REGIONS: Record<string, RegionEditorial> = {
  '11': {
    nom: 'Île-de-France', capitale: 'Paris', pop: 12271794, pib: '765 Md€', pibHab: 62, sup: 12011,
    deps: ['75', '77', '78', '91', '92', '93', '94', '95'],
    climat: 'Océanique dégradé : hivers doux, étés tempérés, ~650 mm de pluie/an.',
    economie: "Première région économique d'Europe : services, finance, sièges sociaux, aéronautique (Safran), luxe, tourisme d'affaires.",
    universites: 'Sorbonne Université, Paris-Saclay, PSL, Sciences Po, Polytechnique — plus de 700 000 étudiants.',
    parcs: '4 PNR : Vexin français, Haute Vallée de Chevreuse, Gâtinais français, Oise-Pays de France.',
    tourisme: 'Première destination touristique mondiale : Paris, Versailles, Fontainebleau, Disneyland Paris.',
    traditions: 'Brie de Meaux et de Melun, jambon de Paris, guinguettes des bords de Marne.',
    histoire: 'Cœur du domaine capétien, la région s\'est construite autour de Paris, capitale du royaume depuis Clovis puis des Capétiens (987).',
  },
  '24': {
    nom: 'Centre-Val de Loire', capitale: 'Orléans', pop: 2573295, pib: '73 Md€', pibHab: 28, sup: 39151,
    deps: ['18', '28', '36', '37', '41', '45'],
    climat: 'Océanique dégradé, doux et modéré ; le Val de Loire bénéficie d\'un microclimat favorable.',
    economie: 'Pharmacie (première région productrice), cosmétique (Cosmetic Valley), céréales de Beauce, tourisme ligérien.',
    universites: "Université d'Orléans, Université de Tours, INSA Centre-Val de Loire.",
    parcs: '3 PNR : Brenne, Loire-Anjou-Touraine, Perche.',
    tourisme: 'Châteaux de la Loire (Chambord, Chenonceau, Blois, Amboise), Val de Loire UNESCO, zoo de Beauval.',
    traditions: 'Vins de Loire (Sancerre, Vouvray, Chinon), crottin de Chavignol, tarte Tatin.',
    histoire: 'Terre royale de la Renaissance : la cour de France s\'installe en Val de Loire aux XVe-XVIe siècles. Jeanne d\'Arc délivre Orléans en 1429.',
  },
  '27': {
    nom: 'Bourgogne-Franche-Comté', capitale: 'Dijon', pop: 2791719, pib: '75 Md€', pibHab: 27, sup: 47784,
    deps: ['21', '25', '39', '58', '70', '71', '89', '90'],
    climat: 'Semi-continental : hivers froids, étés chauds ; fort enneigement dans le Jura.',
    economie: 'Viticulture de prestige, industrie automobile (Sochaux), microtechniques (Besançon), agroalimentaire, bois.',
    universites: 'Université de Bourgogne (Dijon), Université de Franche-Comté (Besançon), UTBM.',
    parcs: '3 PNR (Morvan, Haut-Jura, Ballons des Vosges en partie) et le Parc national de forêts.',
    tourisme: 'Climats de Bourgogne (UNESCO), Hospices de Beaune, Vézelay, citadelle de Besançon (Vauban), lacs du Jura.',
    traditions: 'Bœuf bourguignon, escargots, comté, vin jaune, moutarde de Dijon, cassis.',
    histoire: 'Duché de Bourgogne rival du royaume de France au XVe siècle ; la Franche-Comté, terre d\'Empire, devient française en 1678.',
  },
  '28': {
    nom: 'Normandie', capitale: 'Rouen', pop: 3327077, pib: '94 Md€', pibHab: 28, sup: 29906,
    deps: ['14', '27', '50', '61', '76'],
    climat: 'Océanique franc : doux, humide (~800 mm/an), vents d\'ouest fréquents.',
    economie: 'Première façade énergétique de France (raffinage, nucléaire, éolien en mer), ports du Havre et de Rouen, élevage laitier, lin.',
    universites: 'Université de Caen Normandie, Université de Rouen Normandie, Le Havre Normandie.',
    parcs: '4 PNR : Boucles de la Seine normande, Marais du Cotentin, Perche, Normandie-Maine.',
    tourisme: 'Mont-Saint-Michel, plages du Débarquement, Étretat, Honfleur, Deauville, Giverny.',
    traditions: 'Camembert, livarot, pont-l\'évêque, cidre, calvados, teurgoule ; toile de Jouy et dentelle d\'Alençon.',
    histoire: 'Fondée en 911 par le traité de Saint-Clair-sur-Epte avec les Vikings de Rollon. Guillaume le Conquérant, duc de Normandie, conquiert l\'Angleterre en 1066. Débarquement allié le 6 juin 1944.',
  },
  '32': {
    nom: 'Hauts-de-France', capitale: 'Lille', pop: 5983823, pib: '158 Md€', pibHab: 26, sup: 31806,
    deps: ['02', '59', '60', '62', '80'],
    climat: 'Océanique frais et venteux ; ciels changeants, pluies régulières.',
    economie: 'Industrie automobile et ferroviaire, logistique (hub européen), grande distribution (Lille), agriculture intensive (betterave, pomme de terre).',
    universites: 'Université de Lille (l\'une des plus grandes de France), UPJV Amiens, Artois, ULCO.',
    parcs: '3 PNR : Scarpe-Escaut (le plus ancien de France, 1968), Avesnois, Caps et Marais d\'Opale.',
    tourisme: 'Baie de Somme, Côte d\'Opale, beffrois UNESCO, Louvre-Lens, braderie de Lille, cathédrale d\'Amiens.',
    traditions: 'Carnaval de Dunkerque, géants du Nord, estaminets, maroilles, welsh, moules-frites.',
    histoire: 'Terre des comtés de Flandre et d\'Artois, longtemps disputée aux Habsbourg. Champs de bataille de la Grande Guerre (Somme, Chemin des Dames). Bassin minier UNESCO.',
  },
  '44': {
    nom: 'Grand Est', capitale: 'Strasbourg', pop: 5561287, pib: '157 Md€', pibHab: 28, sup: 57433,
    deps: ['08', '10', '51', '52', '54', '55', '57', '67', '68', '88'],
    climat: 'Semi-continental : hivers rigoureux, étés orageux ; vignoble alsacien abrité par les Vosges.',
    economie: 'Industrie (automobile, chimie, pharmacie), champagne, institutions européennes à Strasbourg, frontalier (Luxembourg, Allemagne, Suisse).',
    universites: 'Université de Strasbourg (5 prix Nobel depuis 2000), Université de Lorraine, URCA Reims.',
    parcs: '6 PNR dont Vosges du Nord, Ballons des Vosges, Montagne de Reims, Lorraine.',
    tourisme: 'Cathédrale et marchés de Noël de Strasbourg, route des vins d\'Alsace, Colmar, caves de Champagne, Verdun.',
    traditions: 'Choucroute, flammekueche, baeckeoffe, kouglof, quiche lorraine, mirabelle, champagne.',
    histoire: 'Marche frontière du royaume : l\'Alsace-Moselle, annexée en 1871 puis en 1940, redevient française en 1918 et 1945. Strasbourg, symbole de la réconciliation européenne.',
  },
  '52': {
    nom: 'Pays de la Loire', capitale: 'Nantes', pop: 3832120, pib: '118 Md€', pibHab: 30, sup: 32082,
    deps: ['44', '49', '53', '72', '85'],
    climat: 'Océanique doux ; ensoleillement notable sur le littoral vendéen.',
    economie: 'Chantiers de l\'Atlantique (Saint-Nazaire), aéronautique, agroalimentaire (première région d\'élevage), nautisme, Vendée Globe.',
    universites: 'Nantes Université, Université d\'Angers, Le Mans Université, Centrale Nantes.',
    parcs: '4 PNR : Brière, Loire-Anjou-Touraine, Normandie-Maine, Marais poitevin.',
    tourisme: 'Puy du Fou, Machines de l\'île à Nantes, 24 Heures du Mans, île d\'Yeu, Saumur, La Baule.',
    traditions: 'Brioche vendéenne, rillettes du Mans, muscadet, Anjou ; gâche et préfou.',
    histoire: 'Héritière de l\'Anjou des Plantagenêts et des marches de Bretagne. L\'édit de Nantes (1598) y fut signé ; guerres de Vendée (1793-1796).',
  },
  '53': {
    nom: 'Bretagne', capitale: 'Rennes', pop: 3373835, pib: '99 Md€', pibHab: 28, sup: 27208,
    deps: ['22', '29', '35', '56'],
    climat: 'Océanique tempéré : doux toute l\'année, pluies fréquentes, forts vents sur les caps.',
    economie: 'Première région agroalimentaire et de pêche de France, télécoms (Lannion), cyberdéfense (Rennes), tourisme littoral.',
    universites: 'Université de Rennes, Rennes 2, UBO Brest, UBS Lorient-Vannes.',
    parcs: '3 PNR : Armorique, Golfe du Morbihan, et le Parc naturel marin d\'Iroise.',
    tourisme: 'Saint-Malo, golfe du Morbihan, pointe du Raz, Carnac, festivals (Vieilles Charrues, Interceltique).',
    traditions: 'Fest-noz (UNESCO), crêpes et galettes, cidre, kouign-amann, langue bretonne, phares et pardons.',
    histoire: 'Duché indépendant jusqu\'à l\'union à la France en 1532. Terre de marins, de corsaires (Surcouf) et d\'explorateurs.',
  },
  '75': {
    nom: 'Nouvelle-Aquitaine', capitale: 'Bordeaux', pop: 6033952, pib: '176 Md€', pibHab: 29, sup: 84036,
    deps: ['16', '17', '19', '23', '24', '33', '40', '47', '64', '79', '86', '87'],
    climat: 'Océanique aquitain : étés chauds, hivers doux, fort ensoleillement au sud.',
    economie: 'Vins de Bordeaux et Cognac, aéronautique-spatial-défense, agriculture (première région agricole d\'Europe), bois des Landes, surf economy.',
    universites: 'Université de Bordeaux, Poitiers (fondée en 1431), La Rochelle, Limoges, Pau.',
    parcs: '5 PNR : Landes de Gascogne, Marais poitevin, Périgord-Limousin, Millevaches en Limousin, Médoc.',
    tourisme: 'Dune du Pilat, Lascaux, Saint-Émilion, île de Ré, Biarritz et la côte basque, Futuroscope.',
    traditions: 'Canelés, huîtres d\'Arcachon, foie gras du Périgord, piment d\'Espelette, pelote basque, cognac.',
    histoire: 'Cœur de l\'Aquitaine d\'Aliénor, anglaise de 1152 à 1453. Préhistoire mondiale en vallée de la Vézère (Lascaux, Cro-Magnon).',
  },
  '76': {
    nom: 'Occitanie', capitale: 'Toulouse', pop: 5973969, pib: '174 Md€', pibHab: 27, sup: 72724,
    deps: ['09', '11', '12', '30', '31', '32', '34', '46', '48', '65', '66', '81', '82'],
    climat: 'Méditerranéen sur le littoral, montagnard dans les Pyrénées et le Massif central ; très ensoleillé.',
    economie: 'Capitale mondiale de l\'aéronautique (Airbus, CNES), viticulture (premier vignoble mondial en surface), tourisme, santé (Montpellier).',
    universites: 'Université de Toulouse (fondée en 1229), Université de Montpellier (médecine depuis 1220, la plus ancienne d\'Europe en activité).',
    parcs: '2 parcs nationaux (Pyrénées, Cévennes) et 8 PNR dont Haut-Languedoc et Grands Causses.',
    tourisme: 'Carcassonne, pont du Gard, Lourdes, gorges du Tarn, Pic du Midi, canal du Midi, plages du Languedoc.',
    traditions: 'Cassoulet, aligot, roquefort, brandade, rugby, langue occitane et catalane, féria.',
    histoire: 'Pays de la langue d\'oc et des cathares (croisade des Albigeois, 1209). Comté de Toulouse rattaché à la couronne en 1271.',
  },
  '84': {
    nom: 'Auvergne-Rhône-Alpes', capitale: 'Lyon', pop: 8078652, pib: '288 Md€', pibHab: 33, sup: 69711,
    deps: ['01', '03', '07', '15', '26', '38', '42', '43', '63', '69', '73', '74'],
    climat: 'Contrasté : semi-continental à Lyon, montagnard dans les Alpes et le Massif central, méditerranéen dans la Drôme.',
    economie: 'Deuxième PIB régional de France : chimie (vallée de la chimie), pharmacie, décolletage, hydroélectricité, sports d\'hiver (premier domaine skiable mondial).',
    universites: 'Université de Lyon, Grenoble Alpes (pôle scientifique majeur), Clermont Auvergne, Savoie Mont Blanc.',
    parcs: '2 parcs nationaux (Vanoise, Écrins en partie) et 10 PNR dont Volcans d\'Auvergne, Vercors, Chartreuse.',
    tourisme: 'Mont Blanc, Chamonix, Annecy, vignobles (Côte-Rôtie, Beaujolais), Puy de Dôme, Fête des Lumières à Lyon.',
    traditions: 'Gastronomie lyonnaise (bouchons), fromages d\'Auvergne (saint-nectaire, cantal), fondue et raclette savoyardes, quenelles.',
    histoire: 'Lugdunum, capitale des Gaules romaines. Lyon, capitale de la soie et berceau du cinéma (frères Lumière, 1895).',
  },
  '93': {
    nom: 'Provence-Alpes-Côte d\'Azur', capitale: 'Marseille', pop: 5098666, pib: '172 Md€', pibHab: 32, sup: 31400,
    deps: ['04', '05', '06', '13', '83', '84'],
    climat: 'Méditerranéen : plus de 2 800 h de soleil/an sur la côte, mistral, climat alpin dans l\'arrière-pays.',
    economie: 'Premier port de France (Marseille-Fos), tourisme international, microélectronique (Rousset), ITER (Cadarache), parfumerie (Grasse).',
    universites: 'Aix-Marseille Université (la plus grande de France), Université Côte d\'Azur, Avignon.',
    parcs: '4 parcs nationaux (Calanques, Port-Cros, Mercantour, Écrins en partie) et 9 PNR dont Camargue, Luberon, Verdon.',
    tourisme: 'Côte d\'Azur, calanques, gorges du Verdon, festival d\'Avignon et de Cannes, villages du Luberon, Nice UNESCO.',
    traditions: 'Bouillabaisse, pastis, pétanque, santons, lavande, transhumance, marchés provençaux.',
    histoire: 'Massalia fondée par les Grecs vers 600 av. J.-C. La Provence, terre d\'Empire puis angevine, rejoint la France en 1481. Le comté de Nice devient français en 1860.',
  },
  '94': {
    nom: 'Corse', capitale: 'Ajaccio', pop: 343701, pib: '10 Md€', pibHab: 27, sup: 8680,
    deps: ['2A', '2B'],
    climat: 'Méditerranéen sur les côtes, alpin en altitude : « une montagne dans la mer ».',
    economie: 'Tourisme (un tiers du PIB), agropastoralisme, viticulture (patrimonio), clémentine, immobilier.',
    universites: 'Université de Corse Pasquale Paoli (Corte).',
    parcs: 'Parc naturel régional de Corse (40 % de l\'île), réserve de Scandola (UNESCO).',
    tourisme: 'GR20, calanques de Piana, Bonifacio, Cap Corse, plages de Palombaggia, Bavella.',
    traditions: 'Polyphonies corses, charcuterie (coppa, lonzu, figatellu), brocciu, châtaigne, langue corse.',
    histoire: 'Génoise pendant quatre siècles, indépendante sous Pasquale Paoli (1755-1769), française depuis 1768. Patrie de Napoléon Bonaparte.',
  },
}

export const METRIC_LABELS: Record<MetricKey, string> = {
  pop: 'Population',
  dens: 'Densité (hab/km²)',
  pibHab: 'PIB par habitant (k€)',
  chom: 'Taux de chômage (%)',
  revMed: 'Revenu médian (€/an)',
  temp: 'Température moyenne (°C)',
  pluie: 'Pluviométrie (mm/an)',
  foret: 'Part de forêt (%)',
  agri: 'Part agricole (%)',
  eolien: 'Éolien installé (MW)',
  solaire: 'Solaire installé (MW)',
  nucleaire: 'Production nucléaire (TWh/an)',
}

export const METRIC_DATA: Record<string, MetricData> = {
  '11': { pop: 12271794, pibHab: 62, chom: 7.1, revMed: 24800, temp: 11.5, pluie: 650, foret: 23, agri: 47, eolien: 60, solaire: 200, nucleaire: 0 },
  '24': { pop: 2573295, pibHab: 28, chom: 6.9, revMed: 21900, temp: 11.5, pluie: 650, foret: 25, agri: 60, eolien: 1400, solaire: 800, nucleaire: 60 },
  '27': { pop: 2791719, pibHab: 27, chom: 6.5, revMed: 21700, temp: 10.8, pluie: 900, foret: 36, agri: 50, eolien: 900, solaire: 500, nucleaire: 0 },
  '28': { pop: 3327077, pibHab: 28, chom: 7.0, revMed: 21500, temp: 11.0, pluie: 800, foret: 17, agri: 65, eolien: 1200, solaire: 300, nucleaire: 65 },
  '32': { pop: 5983823, pibHab: 26, chom: 8.7, revMed: 20300, temp: 10.8, pluie: 700, foret: 13, agri: 67, eolien: 5200, solaire: 300, nucleaire: 35 },
  '44': { pop: 5561287, pibHab: 28, chom: 7.0, revMed: 22200, temp: 10.5, pluie: 800, foret: 34, agri: 40, eolien: 4200, solaire: 800, nucleaire: 30 },
  '52': { pop: 3832120, pibHab: 30, chom: 6.0, revMed: 22000, temp: 11.8, pluie: 750, foret: 10, agri: 64, eolien: 1300, solaire: 700, nucleaire: 0 },
  '53': { pop: 3373835, pibHab: 28, chom: 5.9, revMed: 22400, temp: 11.5, pluie: 900, foret: 14, agri: 60, eolien: 1200, solaire: 400, nucleaire: 0 },
  '75': { pop: 6033952, pibHab: 29, chom: 6.7, revMed: 21800, temp: 12.8, pluie: 900, foret: 34, agri: 40, eolien: 1200, solaire: 3600, nucleaire: 40 },
  '76': { pop: 5973969, pibHab: 27, chom: 8.8, revMed: 20900, temp: 13.5, pluie: 700, foret: 36, agri: 35, eolien: 4300, solaire: 3200, nucleaire: 25 },
  '84': { pop: 8078652, pibHab: 33, chom: 6.3, revMed: 23300, temp: 11.0, pluie: 900, foret: 36, agri: 30, eolien: 700, solaire: 1400, nucleaire: 90 },
  '93': { pop: 5098666, pibHab: 32, chom: 8.0, revMed: 21200, temp: 13.5, pluie: 700, foret: 40, agri: 15, eolien: 100, solaire: 1900, nucleaire: 0 },
  '94': { pop: 343701, pibHab: 27, chom: 6.9, revMed: 20500, temp: 15.0, pluie: 750, foret: 46, agri: 10, eolien: 20, solaire: 200, nucleaire: 0 },
}

export const METRIC_SUP: Record<string, number> = {
  '11': 12011, '24': 39151, '27': 47784, '28': 29906, '32': 31806, '44': 57433,
  '52': 32082, '53': 27208, '75': 84036, '76': 72724, '84': 69711, '93': 31400, '94': 8680,
}

export const DEP_FICHES: Record<string, DepFiche> = {
  '74': {
    sousPrefs: ['Bonneville', 'Saint-Julien-en-Genevois', 'Thonon-les-Bains'], nbCommunes: 279, sup: 4388,
    pointCulminant: 'Mont Blanc (4 806 m)', fleuves: 'Rhône, Arve, Fier, Dranse',
    histoire: 'Ancien duché de Savoie, rattaché à la France en 1860 par le traité de Turin, ratifié par plébiscite.',
    economie: 'Décolletage de la vallée de l\'Arve (leader mondial), tourisme alpin, horlogerie, travail frontalier avec Genève.',
    agriculture: 'Élevage laitier d\'alpage : reblochon, abondance, tomme et chevrotin (AOP).',
    tourisme: 'Chamonix-Mont-Blanc, lac d\'Annecy, stations des Portes du Soleil et du Grand Massif, Yvoire.',
    gastronomie: 'Fondue, tartiflette, diots, crozets, rissoles.',
    specialites: 'Reblochon fermier, génépi, couteaux d\'Opinel (voisin savoyard).',
    monuments: 'Château d\'Annecy, abbaye d\'Abondance, mer de Glace, aiguille du Midi.',
  },
  '29': {
    sousPrefs: ['Brest', 'Châteaulin', 'Morlaix'], nbCommunes: 277, sup: 6733,
    pointCulminant: 'Roc\'h Ruz, monts d\'Arrée (385 m)', fleuves: 'Aulne, Odet, Élorn',
    histoire: '« Fin de la terre » (Penn-ar-Bed en breton), cœur de la Bretagne bretonnante, terre de marins et de pardons.',
    economie: 'Première zone de pêche française (Guilvinec, Concarneau), agroalimentaire, Ifremer et base navale à Brest.',
    agriculture: 'Légumes de Léon (artichaut, chou-fleur), élevage porcin et laitier intensif.',
    tourisme: 'Pointe du Raz, presqu\'île de Crozon, Ouessant, festival du Bout du Monde, Océanopolis.',
    gastronomie: 'Crêpes et galettes, kouign-amann de Douarnenez, cotriade, fraises de Plougastel.',
    specialites: 'Coiffes bigoudènes, faïence de Quimper, phares d\'Iroise.',
    monuments: 'Enclos paroissiaux, cathédrale de Quimper, château de Brest, abbaye de Landévennec.',
  },
  '33': {
    sousPrefs: ['Arcachon', 'Blaye', 'Langon', 'Lesparre-Médoc', 'Libourne'], nbCommunes: 535, sup: 10000,
    pointCulminant: 'Butte de Cazalis (166 m)', fleuves: 'Garonne, Dordogne, estuaire de la Gironde',
    histoire: 'Plus grand département de France métropolitaine. Port de Bordeaux, « port de la Lune », enrichi par le commerce atlantique au XVIIIe siècle.',
    economie: 'Viticulture (premier vignoble AOC de France), aéronautique-défense (Dassault, ArianeGroup), tertiaire bordelais.',
    agriculture: 'Vigne (Médoc, Saint-Émilion, Sauternes), sylviculture des Landes girondines, ostréiculture du bassin d\'Arcachon.',
    tourisme: 'Dune du Pilat, bassin d\'Arcachon, Bordeaux UNESCO, châteaux du Médoc, Saint-Émilion.',
    gastronomie: 'Canelés, entrecôte à la bordelaise, lamproie, huîtres du Cap Ferret.',
    specialites: 'Grands crus classés 1855, Cité du Vin.',
    monuments: 'Place de la Bourse et miroir d\'eau, citadelle de Blaye (Vauban), basilique Saint-Michel.',
  },
  '69': {
    sousPrefs: ['Villefranche-sur-Saône'], nbCommunes: 208, sup: 3249,
    pointCulminant: 'Mont Saint-Rigaud (1 012 m)', fleuves: 'Rhône, Saône',
    histoire: 'Autour de Lugdunum, capitale des Gaules. Lyon, ville de la soie, des canuts et de la Résistance (Jean Moulin).',
    economie: 'Deuxième aire économique de France : chimie-pharmacie, biotechnologies, banque, gastronomie.',
    agriculture: 'Vignoble du Beaujolais (gamay), maraîchage des monts du Lyonnais.',
    tourisme: 'Vieux-Lyon UNESCO, Fête des Lumières, Fourvière, pierres dorées du Beaujolais.',
    gastronomie: 'Bouchons lyonnais : quenelles, tablier de sapeur, cervelle de canut, saucisson brioché.',
    specialites: 'Beaujolais nouveau, guignol, traboules.',
    monuments: 'Basilique de Fourvière, théâtres romains, Hôtel-Dieu, musée des Confluences.',
  },
  '06': {
    sousPrefs: ['Grasse'], nbCommunes: 163, sup: 4299,
    pointCulminant: 'Cime du Gélas (3 143 m)', fleuves: 'Var, Roya, Tinée, Vésubie',
    histoire: 'Comté de Nice, sarde jusqu\'en 1860. Riviera des hivernants anglais et russes au XIXe siècle.',
    economie: 'Tourisme international, technopole Sophia Antipolis (première d\'Europe), parfumerie de Grasse, congrès à Cannes.',
    agriculture: 'Fleurs à parfum (rose de mai, jasmin), oliviers, agrumes de Menton.',
    tourisme: 'Promenade des Anglais, festival de Cannes, villages perchés (Èze, Saint-Paul-de-Vence), Mercantour.',
    gastronomie: 'Salade niçoise, socca, pissaladière, pan bagnat, citron de Menton.',
    specialites: 'Parfums de Grasse (UNESCO), carnaval de Nice.',
    monuments: 'Vieux-Nice, villa Ephrussi de Rothschild, trophée d\'Auguste à La Turbie.',
  },
  '75': {
    sousPrefs: [], nbCommunes: 1, sup: 105,
    pointCulminant: 'Butte Montmartre (131 m)', fleuves: 'Seine',
    histoire: 'Lutèce gauloise puis romaine, capitale du royaume, théâtre de la Révolution française et des grands travaux haussmanniens.',
    economie: 'Premier pôle économique européen : sièges sociaux, finance, mode, tourisme (plus de 30 millions de visiteurs/an).',
    agriculture: 'Agriculture urbaine émergente (toits cultivés, vignes de Montmartre).',
    tourisme: 'Tour Eiffel, Louvre, Notre-Dame, Montmartre, croisières sur la Seine.',
    gastronomie: 'Bistronomie, baguette de tradition (UNESCO), jambon-beurre, macarons.',
    specialites: 'Haute couture, bouquinistes, cafés littéraires.',
    monuments: 'Notre-Dame de Paris, Sainte-Chapelle, Arc de Triomphe, Panthéon, Sacré-Cœur.',
  },
}

// Préfectures : [codeDépartement, nom préfecture, lat, lng].
// Donnée géographique de référence (chefs-lieux + coordonnées), statique par nature.
// Sert la couche « Préfectures » et le recentrage carte sur un département.
export const PREFECTURES: [string, string, number, number][] = [
  ['01', 'Bourg-en-Bresse', 46.205, 5.226], ['02', 'Laon', 49.564, 3.62], ['03', 'Moulins', 46.566, 3.333],
  ['04', 'Digne-les-Bains', 44.092, 6.236], ['05', 'Gap', 44.559, 6.079], ['06', 'Nice', 43.7, 7.268],
  ['07', 'Privas', 44.735, 4.599], ['08', 'Charleville-Mézières', 49.762, 4.726], ['09', 'Foix', 42.966, 1.606],
  ['10', 'Troyes', 48.297, 4.074], ['11', 'Carcassonne', 43.213, 2.351], ['12', 'Rodez', 44.35, 2.575],
  ['13', 'Marseille', 43.297, 5.381], ['14', 'Caen', 49.183, -0.371], ['15', 'Aurillac', 44.931, 2.444],
  ['16', 'Angoulême', 45.649, 0.156], ['17', 'La Rochelle', 46.16, -1.151], ['18', 'Bourges', 47.081, 2.399],
  ['19', 'Tulle', 45.267, 1.772], ['21', 'Dijon', 47.322, 5.041], ['22', 'Saint-Brieuc', 48.514, -2.765],
  ['23', 'Guéret', 46.171, 1.871], ['24', 'Périgueux', 45.184, 0.721], ['25', 'Besançon', 47.238, 6.024],
  ['26', 'Valence', 44.933, 4.892], ['27', 'Évreux', 49.024, 1.151], ['28', 'Chartres', 48.447, 1.484],
  ['29', 'Quimper', 47.996, -4.102], ['2A', 'Ajaccio', 41.919, 8.739], ['2B', 'Bastia', 42.702, 9.45],
  ['30', 'Nîmes', 43.837, 4.36], ['31', 'Toulouse', 43.604, 1.444], ['32', 'Auch', 43.646, 0.586],
  ['33', 'Bordeaux', 44.838, -0.579], ['34', 'Montpellier', 43.611, 3.877], ['35', 'Rennes', 48.117, -1.678],
  ['36', 'Châteauroux', 46.811, 1.691], ['37', 'Tours', 47.394, 0.685], ['38', 'Grenoble', 45.188, 5.724],
  ['39', 'Lons-le-Saunier', 46.675, 5.554], ['40', 'Mont-de-Marsan', 43.89, -0.5], ['41', 'Blois', 47.586, 1.335],
  ['42', 'Saint-Étienne', 45.44, 4.387], ['43', 'Le Puy-en-Velay', 45.043, 3.885], ['44', 'Nantes', 47.218, -1.554],
  ['45', 'Orléans', 47.902, 1.909], ['46', 'Cahors', 44.449, 1.436], ['47', 'Agen', 44.203, 0.616],
  ['48', 'Mende', 44.518, 3.5], ['49', 'Angers', 47.478, -0.563], ['50', 'Saint-Lô', 49.116, -1.09],
  ['51', 'Châlons-en-Champagne', 48.957, 4.363], ['52', 'Chaumont', 48.111, 5.139], ['53', 'Laval', 48.073, -0.77],
  ['54', 'Nancy', 48.692, 6.184], ['55', 'Bar-le-Duc', 48.771, 5.161], ['56', 'Vannes', 47.658, -2.76],
  ['57', 'Metz', 49.12, 6.177], ['58', 'Nevers', 46.99, 3.159], ['59', 'Lille', 50.629, 3.057],
  ['60', 'Beauvais', 49.43, 2.081], ['61', 'Alençon', 48.432, 0.091], ['62', 'Arras', 50.291, 2.777],
  ['63', 'Clermont-Ferrand', 45.777, 3.087], ['64', 'Pau', 43.296, -0.37], ['65', 'Tarbes', 43.233, 0.078],
  ['66', 'Perpignan', 42.699, 2.895], ['67', 'Strasbourg', 48.573, 7.752], ['68', 'Colmar', 48.079, 7.358],
  ['69', 'Lyon', 45.764, 4.836], ['70', 'Vesoul', 47.62, 6.155], ['71', 'Mâcon', 46.307, 4.828],
  ['72', 'Le Mans', 48.006, 0.199], ['73', 'Chambéry', 45.564, 5.918], ['74', 'Annecy', 45.899, 6.129],
  ['75', 'Paris', 48.857, 2.352], ['76', 'Rouen', 49.443, 1.099], ['77', 'Melun', 48.54, 2.66],
  ['78', 'Versailles', 48.804, 2.13], ['79', 'Niort', 46.323, -0.459], ['80', 'Amiens', 49.894, 2.296],
  ['81', 'Albi', 43.929, 2.148], ['82', 'Montauban', 44.018, 1.355], ['83', 'Toulon', 43.124, 5.928],
  ['84', 'Avignon', 43.949, 4.806], ['85', 'La Roche-sur-Yon', 46.67, -1.426], ['86', 'Poitiers', 46.58, 0.34],
  ['87', 'Limoges', 45.834, 1.262], ['88', 'Épinal', 48.174, 6.449], ['89', 'Auxerre', 47.798, 3.573],
  ['90', 'Belfort', 47.638, 6.863], ['91', 'Évry-Courcouronnes', 48.63, 2.446], ['92', 'Nanterre', 48.892, 2.207],
  ['93', 'Bobigny', 48.906, 2.451], ['94', 'Créteil', 48.79, 2.455], ['95', 'Pontoise', 49.05, 2.099],
]

// Grandes villes (marqueurs affichés au niveau national)
export const VILLES: Ville[] = [
  ['Paris', 48.8566, 2.3522, 2133111], ['Marseille', 43.2965, 5.3698, 873076], ['Lyon', 45.764, 4.8357, 522250], ['Toulouse', 43.6047, 1.4442, 504078],
  ['Nice', 43.7102, 7.262, 342669], ['Nantes', 47.2184, -1.5536, 320732], ['Montpellier', 43.6108, 3.8767, 299096], ['Strasbourg', 48.5734, 7.7521, 290576],
  ['Bordeaux', 44.8378, -0.5792, 261804], ['Lille', 50.6292, 3.0573, 236234], ['Rennes', 48.1173, -1.6778, 222485], ['Toulon', 43.1242, 5.928, 180452],
  ['Reims', 49.2583, 4.0317, 181194], ['Saint-Étienne', 45.4397, 4.3872, 173821], ['Le Havre', 49.4944, 0.1079, 165830], ['Grenoble', 45.1885, 5.7245, 157477],
  ['Dijon', 47.322, 5.0415, 159346], ['Angers', 47.4784, -0.5632, 157175], ['Nîmes', 43.8367, 4.3601, 148104], ['Clermont-Ferrand', 45.7772, 3.087, 147865],
]

export const FLEUVES: Fleuve[] = [
  { nom: 'Loire', longueur: '1 006 km', pts: [[44.842, 4.221], [45.043, 3.885], [46.04, 4.07], [46.99, 3.16], [47.9, 1.9], [47.59, 1.33], [47.39, 0.69], [47.26, -0.08], [47.21, -1.55], [47.28, -2.15]] },
  { nom: 'Seine', longueur: '775 km', pts: [[47.5, 4.72], [48.3, 4.08], [48.53, 2.66], [48.85, 2.35], [49.06, 1.4], [49.44, 1.1], [49.47, 0.3]] },
  { nom: 'Rhône', longueur: '545 km (en France)', pts: [[46.2, 6.1], [45.93, 5.65], [45.764, 4.836], [44.93, 4.89], [44.55, 4.75], [43.95, 4.81], [43.68, 4.63], [43.4, 4.8]] },
  { nom: 'Garonne', longueur: '529 km (en France)', pts: [[42.85, 0.6], [43.11, 0.98], [43.6, 1.44], [44.02, 1.1], [44.2, 0.62], [44.56, 0.24], [44.84, -0.58], [45.3, -0.78]] },
  { nom: 'Rhin', longueur: '188 km (frontière)', pts: [[47.59, 7.59], [47.82, 7.55], [48.08, 7.58], [48.57, 7.8], [48.83, 8.0], [48.97, 8.2]] },
]

export const RIVIERES: string[] = [
  'Dordogne (483 km)', 'Marne (514 km)', 'Lot (485 km)', 'Saône (480 km)', 'Doubs (453 km)',
  'Allier (421 km)', 'Charente (381 km)', 'Tarn (381 km)', 'Vienne (363 km)', 'Oise (341 km)',
]

export const SOMMETS: Sommet[] = [
  ['Mont Blanc', 45.8326, 6.8652, 4806, 'Alpes'], ['Barre des Écrins', 44.9226, 6.3597, 4102, 'Alpes'], ['Grande Casse', 45.403, 6.859, 3855, 'Alpes (Vanoise)'],
  ['Vignemale', 42.7742, -0.1438, 3298, 'Pyrénées'], ['Pic du Midi de Bigorre', 42.9369, 0.1411, 2877, 'Pyrénées'], ['Canigou', 42.519, 2.4566, 2784, 'Pyrénées'],
  ['Monte Cinto', 42.3805, 8.9406, 2706, 'Corse'], ['Mont Ventoux', 44.174, 5.2786, 1910, 'Préalpes'], ['Puy de Sancy', 45.528, 2.813, 1885, 'Massif central'],
  ['Puy de Dôme', 45.7723, 2.9644, 1465, 'Massif central'], ['Crêt de la Neige', 46.271, 5.941, 1720, 'Jura'], ['Grand Ballon', 47.901, 7.099, 1424, 'Vosges'],
]

export const MASSIFS: string[] = [
  'Alpes (Mont Blanc, 4 806 m)', 'Pyrénées (Vignemale, 3 298 m)', 'Massif central (Puy de Sancy, 1 885 m)',
  'Jura (Crêt de la Neige, 1 720 m)', 'Vosges (Grand Ballon, 1 424 m)', 'Massif armoricain (385 m)', 'Massif corse (Monte Cinto, 2 706 m)',
]

export const PARCS: Parc[] = [
  ['Parc national de la Vanoise', 45.35, 6.85, 'National, 1963 — le premier de France'], ['Parc national des Écrins', 44.85, 6.3, 'National, 1973'],
  ['Parc national du Mercantour', 44.1, 7.2, 'National, 1979'], ['Parc national des Pyrénées', 42.85, -0.1, 'National, 1967'],
  ['Parc national des Cévennes', 44.25, 3.6, 'National, 1970 — réserve de biosphère'], ['Parc national des Calanques', 43.21, 5.45, 'National, 2012 — terre, mer et périurbain'],
  ['Parc national de Port-Cros', 43.0, 6.39, 'National, 1963 — marin'], ['Parc national de forêts', 47.85, 4.95, 'National, 2019 — le plus récent'],
  ['PNR des Volcans d\'Auvergne', 45.35, 2.75, 'Régional — le plus vaste de France métropolitaine'], ['PNR du Vercors', 44.95, 5.4, 'Régional'],
  ['PNR de Camargue', 43.53, 4.5, 'Régional — zone humide majeure'], ['PNR d\'Armorique', 48.35, -3.9, 'Régional'],
  ['PNR du Morvan', 47.1, 4.05, 'Régional'], ['PNR du Luberon', 43.8, 5.35, 'Régional'],
]

export const LACS: Lac[] = [
  ['Lac Léman (part fr.)', 46.37, 6.45, '580 km² (234 côté fr.) — le plus grand lac alpin d\'Europe'], ['Lac d\'Annecy', 45.86, 6.17, '27 km² — réputé le plus pur d\'Europe'],
  ['Lac du Bourget', 45.73, 5.86, '44,5 km² — plus grand lac naturel entièrement français'], ['Lac de Serre-Ponçon', 44.5, 6.3, '28 km² — grande retenue artificielle'],
  ['Lac de Grand-Lieu', 47.08, -1.66, '63 km² en hiver — réserve ornithologique'], ['Lac d\'Hourtin-Carcans', 45.16, -1.07, '62 km² — plus grand lac d\'eau douce de France'],
]

export const CASCADES: string[] = [
  'Cascade de Gavarnie (422 m, la plus haute de France)', 'Grande cascade du Rutor', 'Cascades du Hérisson (Jura)', 'Cascade d\'Ars (Ariège)',
]
export const ZONES_HUMIDES: string[] = ['Camargue', 'Marais poitevin', 'Baie de Somme', 'Brenne (« pays des mille étangs »)', 'Marais du Cotentin', 'Dombes']
export const FORETS: string[] = [
  'Landes de Gascogne (~1 M ha, plus grande forêt cultivée d\'Europe de l\'Ouest)', 'Forêt d\'Orléans (35 000 ha, plus grande forêt domaniale)',
  'Fontainebleau', 'Tronçais (chênaie)', 'Forêt des Vosges', 'Forêt de Chantilly',
]
export const LITTORAL =
  '5 853 km de côtes en métropole : Manche-mer du Nord (falaises, estuaires), Atlantique (dunes, marais, îles), Méditerranée (calanques, deltas). Protégé par le Conservatoire du littoral (plus de 200 000 ha).'

export const POIS: Poi[] = [
  ['Tour Eiffel', 'Monument', 48.8584, 2.2945, 'Paris — 330 m, construite en 1889'], ['Mont-Saint-Michel', 'Monument', 48.6361, -1.5115, 'Manche — abbaye UNESCO, baie aux plus grandes marées d\'Europe'],
  ['Château de Versailles', 'Château', 48.8049, 2.1204, 'Yvelines — palais du Roi-Soleil, UNESCO'], ['Château de Chambord', 'Château', 47.6162, 1.517, 'Loir-et-Cher — chef-d\'œuvre Renaissance, 1519'],
  ['Château de Chenonceau', 'Château', 47.3249, 1.0706, 'Indre-et-Loire — le « château des Dames » sur le Cher'], ['Cité de Carcassonne', 'Monument', 43.2065, 2.3644, 'Aude — cité médiévale fortifiée, UNESCO'],
  ['Pont du Gard', 'Monument', 43.9475, 4.535, 'Gard — aqueduc romain du Ier siècle, UNESCO'], ['Musée du Louvre', 'Musée', 48.8606, 2.3376, 'Paris — le plus grand musée du monde'],
  ['Musée d\'Orsay', 'Musée', 48.86, 2.3266, 'Paris — impressionnistes, dans une ancienne gare'], ['Dune du Pilat', 'Site naturel', 44.5893, -1.211, 'Gironde — la plus haute dune d\'Europe (~106 m)'],
  ['Gorges du Verdon', 'Site naturel', 43.75, 6.3167, 'Le plus grand canyon d\'Europe (700 m de profondeur)'], ['Puy du Fou', 'Parc', 46.8903, -0.9303, 'Vendée — grand parc historique'],
  ['Mont Blanc', 'Montagne', 45.8326, 6.8652, 'Plus haut sommet des Alpes et d\'Europe occidentale, 4 806 m'], ['Lac d\'Annecy', 'Lac', 45.86, 6.17, 'Haute-Savoie'],
  ['Château du Haut-Kœnigsbourg', 'Château', 48.2494, 7.3444, 'Bas-Rhin — forteresse médiévale restaurée'], ['Musée des Confluences', 'Musée', 45.7327, 4.818, 'Lyon — sciences et sociétés'],
]
