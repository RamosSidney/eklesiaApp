import { StyleSheet } from 'react-native'

export const colors = {
  brand:      '#534AB7',
  brandLight: '#EEEDFE',
  brandDark:  '#3C3489',
  brandText:  '#26215C',
  bg:         '#F9F8F4',
  bgCard:     '#FFFFFF',
  border:     '#E8E6DF',
  text:       '#1C1C1A',
  textSub:    '#73726C',
  textMuted:  '#9C9A92',
  green:      '#27500A',
  greenBg:    '#EAF3DE',
  amber:      '#633806',
  amberBg:    '#FAEEDA',
  red:        '#72243E',
  redBg:      '#FBEAF0',
}

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active:          { bg: colors.greenBg,  text: colors.green },
  visitor:         { bg: colors.amberBg,  text: colors.amber },
  in_discipleship: { bg: '#DBEAFE',       text: '#1E40AF' },
  inactive:        { bg: '#F1EFE8',       text: '#444441' },
  transferred:     { bg: colors.brandLight, text: colors.brandText },
  deceased:        { bg: colors.redBg,    text: colors.red },
}

export const STATUS_LABELS: Record<string, string> = {
  active:          'Ativo',
  visitor:         'Visitante',
  in_discipleship: 'Em discipulado',
  inactive:        'Inativo',
  transferred:     'Transferido',
  deceased:        'Falecido',
}

export const base = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  input: {
    backgroundColor: colors.bgCard,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSub,
    marginBottom: 4,
  },
  btnPrimary: {
    backgroundColor: colors.brand,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
  },
  btnPrimaryText: {
    color: '#FFF',
    fontWeight: '500',
    fontSize: 14,
  },
  btnSecondary: {
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
  },
  btnSecondaryText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 14,
  },
})
