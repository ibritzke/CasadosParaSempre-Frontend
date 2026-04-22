// src/pages/AdminPage.tsx
import React, { useEffect, useState } from "react";

import { useAuthStore } from "@/store/auth.store";
import { adminApi } from "@/services/api";
import { useToast } from "@/components/ui/Toast";
import { AdminStats, AdminUser } from "@/types";
import {
  ActionRow,
  Bar,
  BarWrap,
  Page,
  PillColorDot,
  PillStatCard,
  SearchInput,
  SectionTitle,
  SmallBtn,
  StatCard,
  StatLabel,
  StatNum,
  StatsGrid,
  Tag,
  TagRow,
  UserAvatar,
  UserCard,
  UserEmail,
  UserInfo,
  UserName,
  UserTop,
} from "./style";

interface PillStat {
  id: number;
  name: string;
  emoji: string;
  color: string;
  count: number;
}

export default function AdminPage() {
  const { theme, user } = useAuthStore();
  const { show } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pillStats, setPillStats] = useState<PillStat[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [s, u, p] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getPillStats(),
      ]);
      setStats(s.data.stats);
      setUsers(u.data.users);
      setPillStats(p.data.pillStats);
    } catch {
      show("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = async (q: string) => {
    setSearch(q);
    try {
      const { data } = await adminApi.getUsers({ search: q });
      setUsers(data.users);
    } catch {}
  };

  const toggleAdmin = async (id: string, name: string) => {
    if (!window.confirm(`Alterar status admin de ${name}?`)) return;
    try {
      await adminApi.toggleAdmin(id);
      show("Admin atualizado");
      loadData();
    } catch {
      show("Erro");
    }
  };

  const toggleActive = async (id: string, name: string) => {
    if (!window.confirm(`Alterar status de ${name}?`)) return;
    try {
      await adminApi.toggleActive(id);
      show("Usuário atualizado");
      loadData();
    } catch {
      show("Erro");
    }
  };
  const deleteUser = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Excluir a conta de ${name}? Todo o histórico será perdido.`,
      )
    )
      return;
    try {
      await adminApi.deleteUser(id);
      show("Conta excluída");
      loadData();
    } catch {
      show("Erro ao excluir");
    }
  };
  const maxCount = pillStats[0]?.count || 1;

  if (loading)
    return (
      <Page $bg={theme.cream}>
        <p style={{ color: theme.textMuted }}>Carregando...</p>
      </Page>
    );

  return (
    <Page $bg={theme.cream}>
      <SectionTitle $color={theme.primaryDark}>Painel Admin ⭐</SectionTitle>

      {stats && (
        <StatsGrid>
          {[
            { num: stats.totalUsers, label: "Usuários total" },
            { num: stats.couples, label: "Casais aprox." },
            { num: stats.totalDraws, label: "Pílulas sorteadas" },
            { num: stats.totalRecords, label: "Registros feitos" },
            { num: stats.husbands, label: "Maridos" },
            { num: stats.wives, label: "Esposas" },
          ].map((s, i) => (
            <StatCard key={i} $bg={theme.white} $border={theme.border}>
              <StatNum $color={theme.primary}>{s.num}</StatNum>
              <StatLabel $color={theme.textMuted}>{s.label}</StatLabel>
            </StatCard>
          ))}
        </StatsGrid>
      )}

      {/* Pill stats */}
      {pillStats.length > 0 && (
        <>
          <SectionTitle $color={theme.primaryDark}>
            Pílulas mais sorteadas
          </SectionTitle>
          {pillStats.slice(0, 5).map((p) => (
            <PillStatCard key={p.id} $bg={theme.white} $border={theme.border}>
              <PillColorDot $color={p.color} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 13, color: theme.text }}>
                    {p.emoji} {p.name}
                  </span>
                  <span style={{ fontSize: 12, color: theme.textMuted }}>
                    {p.count}x
                  </span>
                </div>
                <BarWrap $bg={theme.border}>
                  <Bar
                    $color={p.color}
                    $pct={Math.round((p.count / maxCount) * 100)}
                  />
                </BarWrap>
              </div>
            </PillStatCard>
          ))}
          <div style={{ marginBottom: 24 }} />
        </>
      )}

      {/* Users */}
      <SectionTitle $color={theme.primaryDark}>
        Usuários cadastrados
      </SectionTitle>
      <SearchInput
        placeholder="Buscar por nome ou email..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        $border={theme.border}
        $primary={theme.primary}
      />

      {users.map((u) => {
        const initials = u.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("");
        const isHusband = u.role === "HUSBAND";
        const avatarBg = isHusband ? "#DBEAFE" : "#F5E6EE";
        const avatarColor = isHusband ? "#1D4ED8" : "#8B3A62";
        const isSelf = u.id === user?.id;

        return (
          <UserCard
            key={u.id}
            $bg={theme.white}
            $border={theme.border}
            $disabled={!u.isActive}
          >
            <UserTop>
              <UserAvatar $bg={avatarBg} $color={avatarColor}>
                {initials}
              </UserAvatar>
              <UserInfo>
                <UserName $color={theme.text}>
                  {u.name} {isSelf ? "(você)" : ""}
                </UserName>
                <UserEmail $color={theme.textMuted}>{u.email}</UserEmail>
              </UserInfo>
            </UserTop>

            <TagRow>
              <Tag
                $bg={isHusband ? "#DBEAFE" : "#F5E6EE"}
                $color={isHusband ? "#1D4ED8" : "#8B3A62"}
              >
                {isHusband ? "Marido" : "Esposa"}
              </Tag>
              {u.isAdmin && (
                <Tag $bg="#FEF3C7" $color="#D97706">
                  ⭐ Admin
                </Tag>
              )}
              <Tag
                $bg={u.isActive ? "#DCFCE7" : "#FEE2E2"}
                $color={u.isActive ? "#16A34A" : "#DC2626"}
              >
                {u.isActive ? "Ativo" : "Inativo"}
              </Tag>
              <Tag $bg="#F1F5F9" $color="#475569">
                {u._count.pillDraws} pílulas
              </Tag>
            </TagRow>

            {!isSelf && (
              <ActionRow>
                <SmallBtn
                  $bg={u.isAdmin ? "#FEF3C7" : theme.primaryLight}
                  $color={u.isAdmin ? "#D97706" : theme.primary}
                  onClick={() => toggleAdmin(u.id, u.name)}
                >
                  {u.isAdmin ? "⭐ Remover admin" : "⭐ Tornar admin"}
                </SmallBtn>
                <SmallBtn
                  $bg={u.isActive ? "#FEE2E2" : "#DCFCE7"}
                  $color={u.isActive ? "#DC2626" : "#16A34A"}
                  onClick={() => toggleActive(u.id, u.name)}
                >
                  {u.isActive ? "Desativar" : "Ativar"}
                </SmallBtn>
                <SmallBtn
                  $bg="#FEE2E2"
                  $color="#DC2626"
                  onClick={() => deleteUser(u.id, u.name)}
                >
                  🗑 Excluir conta
                </SmallBtn>
              </ActionRow>
            )}
          </UserCard>
        );
      })}
    </Page>
  );
}
