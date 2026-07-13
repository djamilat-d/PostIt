// Palette partagée par le formulaire (NoteModifier) et le filtre de la
// liste (NotePost), pour pas dupliquer les mêmes valeurs à deux endroits.
export const NOTE_COLORS = [
  {
    value: 'orange',
    label: 'Orange',
    gradient: 'linear-gradient(150deg, var(--postit-orange-a), var(--postit-orange-b))',
  },
  {
    value: 'yellow',
    label: 'Jaune',
    gradient: 'linear-gradient(150deg, var(--postit-yellow-a), var(--postit-yellow-b))',
  },
  {
    value: 'green',
    label: 'Vert',
    gradient: 'linear-gradient(150deg, var(--postit-green-a), var(--postit-green-b))',
  },
  {
    value: 'blue',
    label: 'Bleu',
    gradient: 'linear-gradient(150deg, var(--postit-blue-a), var(--postit-blue-b))',
  },
  {
    value: 'pink',
    label: 'Rose',
    gradient: 'linear-gradient(150deg, var(--postit-pink-a), var(--postit-pink-b))',
  },
]
