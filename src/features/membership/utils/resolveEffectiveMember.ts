/**
 * SPWN Apps 2.0 - Shared Effective Member Resolver
 */
export interface EffectiveMemberScope {
  provinceId?: string;
  regencyId?: string;
  districtId?: string;
  pangkalanId?: string;
}

const norm = (value: unknown) =>
  String(value ?? '').trim().toLowerCase();

const upper = (value: unknown) =>
  String(value ?? '').trim().toUpperCase().replace(/_/g, ' ');

export const normalizeQaMemberPosition = (member: any) => {
  const raw = upper(
    member?.position ||
    member?.jabatan ||
    member?.jabatan_khusus ||
    member?.currentPosition ||
    member?.tingkat_keanggotaan ||
    member?.role ||
    ''
  );

  if (raw === 'PINSAKA' || raw === 'PIN SAKA') return 'PIMPINAN SAKA';
  if (raw === 'PAMONG') return 'PAMONG SAKA';
  if (raw === 'MABI SAKA') return 'MABISAKA';
  if (raw === 'DEWANSAKA') return 'DEWAN SAKA';
  return raw;
};

const desiredPositions = (perspective?: string): string[] => {
  const p = upper(perspective);
  if (p === 'ANGGOTA') return ['ANGGOTA', 'DEWAN SAKA'];
  if (p === 'PAMONG SAKA') return ['PAMONG SAKA'];
  if (p === 'PINSAKA' || p === 'PIMPINAN SAKA') return ['PIMPINAN SAKA'];
  if (p === 'MABISAKA') return ['MABISAKA'];
  return [];
};

const matchesIdentity = (member: any, identity: unknown) => {
  const target = norm(identity);
  if (!target) return false;

  return [
    member?.id,
    member?.member_id,
    member?.memberId,
    member?.nomor_kta,
    member?.no_kta,
    member?.email,
    member?.username,
    member?.user_id,
  ]
    .map(norm)
    .filter(Boolean)
    .includes(target);
};

const matchesScope = (member: any, scope?: EffectiveMemberScope) => {
  if (!scope) return true;

  const checks = [
    [scope.provinceId, [member?.provinsi_id, member?.kode_provinsi, member?.province_id]],
    [scope.regencyId, [member?.kabupaten_kota_id, member?.kabupaten_id, member?.kode_kabupaten, member?.regency_id]],
    [scope.districtId, [member?.kecamatan_id, member?.wilayah_kecamatan_id, member?.kode_kecamatan, member?.district_id]],
    [scope.pangkalanId, [member?.pangkalan_id, member?.pangkalan_gudep, member?.pangkalan, member?.gugus_depan]],
  ] as const;

  return checks.every(([expected, actual]) => {
    const exp = norm(expected);
    if (!exp || exp === 'all') return true;
    return actual.map(norm).filter(Boolean).includes(exp);
  });
};

const resolveOwnMember = (list: any[], user: any) => {
  const identities = [
    user?.memberProfile?.member_id,
    user?.memberProfile?.id,
    user?.memberId,
    user?.nomor_kta,
    user?.no_kta,
    user?.email,
    user?.id,
  ].map(norm).filter(Boolean);

  const exact = list.find((member: any) =>
    identities.some((identity) => matchesIdentity(member, identity))
  );
  if (exact) return exact;

  const userName = norm(user?.fullName || user?.full_name || user?.name);
  if (!userName) return null;

  return (
    list.find((member: any) =>
      norm(member?.full_name || member?.nama_lengkap || member?.fullName || member?.nama) === userName
    ) || null
  );
};

export const resolveEffectiveMember = ({
  members,
  currentUser,
  qaPerspective,
  selectedMemberId,
  scope,
}: {
  members: any[];
  currentUser: any;
  qaPerspective?: string;
  selectedMemberId?: string | null;
  scope?: EffectiveMemberScope;
}) => {
  const list = Array.isArray(members) ? members : [];
  const authRole = upper(currentUser?.role);

  // Login MEMBER nyata selalu dirinya sendiri.
  if (authRole === 'MEMBER') {
    return resolveOwnMember(list, currentUser);
  }

  // QA SuperAdmin: identitas mengikuti perspektif yang sedang diuji.
  if (authRole === 'SUPER ADMIN' || authRole === 'SUPER_ADMIN') {
    const wanted = desiredPositions(qaPerspective);
    const scoped = list.filter((member: any) => matchesScope(member, scope));

    if (wanted.length) {
      if (selectedMemberId) {
        const selected = scoped.find((member: any) =>
          matchesIdentity(member, selectedMemberId)
        );

        if (
          selected &&
          wanted.includes(normalizeQaMemberPosition(selected))
        ) {
          return selected;
        }
      }

      return (
        scoped.find((member: any) =>
          wanted.includes(normalizeQaMemberPosition(member))
        ) || null
      );
    }
  }

  return resolveOwnMember(list, currentUser);
};
