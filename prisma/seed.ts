import { PrismaClient, RegionType, UserRole, UserStatus } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function inviteCode(prefix: string) {
  const code = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  return `${prefix}-${code}`;
}

async function getOrCreateCampaign(name: string) {
  const existing = await prisma.campaign.findFirst({ where: { name } });
  if (existing) return existing;

  return prisma.campaign.create({
    data: {
      name,
      description: 'Seed inicial para desenvolvimento',
      isActive: true,
    },
  });
}

async function upsertRegionByNameAndParent(params: {
  campaignId: string;
  name: string;
  type: RegionType;
  parentId: string | null;
  code?: string | null;
}) {
  const { campaignId, name, type, parentId, code } = params;

  const existing = await prisma.region.findFirst({
    where: { campaignId, name, parentId: parentId ?? null },
  });

  if (existing) {
    return prisma.region.update({
      where: { id: existing.id },
      data: {
        type,
        code: code ?? existing.code,
      },
    });
  }

  return prisma.region.create({
    data: {
      campaignId,
      name,
      type,
      parentId: parentId ?? null,
      code: code ?? undefined,
    },
  });
}

async function main() {
  const campaignName = 'Campanha Demo 2026';
  const candidateEmail = 'candidato@cdit.local';

  // 1) Campaign
  const campaign = await getOrCreateCampaign(campaignName);

  // 2) Regions (ESTADO -> CIDADE -> BAIRRO)
  const estadoDF = await upsertRegionByNameAndParent({
    campaignId: campaign.id,
    name: 'DF',
    code: 'DF',
    type: RegionType.ESTADO,
    parentId: null,
  });

  const cidadeBrasilia = await upsertRegionByNameAndParent({
    campaignId: campaign.id,
    name: 'Brasília',
    type: RegionType.CIDADE,
    parentId: estadoDF.id,
  });

  const bairros = ['Ceilândia', 'Taguatinga', 'Vicente Pires', 'Águas Claras'];

  // ✅ Aqui está a correção do "never[]"
  const bairrosCriados: string[] = [];

  for (const bairro of bairros) {
    const b = await upsertRegionByNameAndParent({
      campaignId: campaign.id,
      name: bairro,
      type: RegionType.BAIRRO,
      parentId: cidadeBrasilia.id,
    });

    // ✅ salva só o nome
    bairrosCriados.push(b.name);
  }

  // 3) User (Candidato)
  const candidate = await prisma.user.upsert({
    where: { email: candidateEmail },
    update: {
      fullName: 'Candidato Demo',
      role: UserRole.CANDIDATO,
      status: UserStatus.ACTIVE,
    },
    create: {
      fullName: 'Candidato Demo',
      email: candidateEmail,
      passwordHash: 'hash_fake_seed_alterar_depois',
      role: UserRole.CANDIDATO,
      status: UserStatus.ACTIVE,
    },
  });

  // 4) CampaignMember
  const member = await prisma.campaignMember.upsert({
    where: {
      campaignId_userId: {
        campaignId: campaign.id,
        userId: candidate.id,
      },
    },
    update: {
      role: UserRole.CANDIDATO,
      status: UserStatus.ACTIVE,
      regionId: estadoDF.id,
    },
    create: {
      campaignId: campaign.id,
      userId: candidate.id,
      role: UserRole.CANDIDATO,
      status: UserStatus.ACTIVE,
      regionId: estadoDF.id,
    },
  });

  // 5) HierarchyNode raiz
  const rootInvite = inviteCode('CAND');

  await prisma.hierarchyNode.upsert({
    where: {
      campaignId_userId: {
        campaignId: campaign.id,
        userId: candidate.id,
      },
    },
    update: {
      level: 0,
      parentNodeId: null,
      path: '/root',
      isBlocked: false,
      inviteCode: rootInvite,
    },
    create: {
      campaignId: campaign.id,
      userId: candidate.id,
      level: 0,
      parentNodeId: null,
      path: '/root',
      isBlocked: false,
      inviteCode: rootInvite,
    },
  });

  // 6) Expense Categories padrão
  const categories = [
    { name: 'Gasolina', type: 'GASOLINA' as const },
    { name: 'Alimentação', type: 'ALIMENTACAO' as const },
    { name: 'Evento', type: 'EVENTO' as const },
    { name: 'Estrutura', type: 'ESTRUTURA' as const },
    { name: 'Material gráfico', type: 'MATERIAL_GRAFICO' as const },
    { name: 'Som', type: 'SOM' as const },
    { name: 'Trio elétrico', type: 'TRIO_ELETRICO' as const },
    { name: 'Equipe', type: 'EQUIPE' as const },
    { name: 'Publicidade', type: 'PUBLICIDADE' as const },
    { name: 'Outros', type: 'OUTROS' as const },
  ];

  for (const c of categories) {
    await prisma.expenseCategory.upsert({
      where: { name: c.name },
      update: { type: c.type, active: true },
      create: { name: c.name, type: c.type, active: true },
    });
  }

  console.log('✅ Seed finalizado com sucesso!');
  console.log('Campaign:', campaign.name, campaign.id);
  console.log('Estado:', estadoDF.name, estadoDF.id);
  console.log('Cidade:', cidadeBrasilia.name, cidadeBrasilia.id);
  console.log('Bairros:', bairrosCriados.join(', '));
  console.log('Candidato:', candidate.email, candidate.id);
  console.log('Member:', member.id);
  console.log('InviteCode (raiz):', rootInvite);
}

main()
  .catch((e) => {
    console.error('❌ Seed falhou:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
