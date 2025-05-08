import { Message } from 'discord.js';
import {
  parseEternalEmbed,
  parseDungeonEmbed,
  parseProfileEmbed,
  parseInventoryEmbed
} from './eUtils';

import {
  saveOrUpdateEternityProfile,
  addEternalUnseal,
  addEternalDungeonWin
} from '/home/ubuntu/ep_bot/extras/functions.js';

import { getCachedTimeTravels, cacheTimeTravels } from '../utils/ttCache';
import { tryFindUserIdByName } from './eternityUtils';
import { forceProfileSync } from './forceProfileSync';

export async function handleFlameDetection(message: Message): Promise<void> {
  const embed = message.embeds[0];
  const playerName = embed.author?.name?.split("—")[0]?.trim();
  const guildId = message.guild?.id;

  if (!playerName || !guildId) return;

  const userId = await tryFindUserIdByName(message.guild, playerName);
  if (!userId) return;

  const parsed = parseInventoryEmbed(embed);
  const flames = parsed?.eternityFlames ?? 0;

  // 🛡️ Prevent overwriting with 0
  if (!flames || flames === 0) {
    return;
  }

  await saveOrUpdateEternityProfile(userId, guildId, null, flames);
  console.log(`🔥 Detected ${flames} flames for ${playerName}`);
}

export async function handleProfileEmbed(message: Message): Promise<void> {
  const embed = message.embeds[0];
  if (!embed?.fields?.length) return;

  const progressField = embed.fields.find(f => f.name.toLowerCase().includes("progress"))?.value || "";
  const match = progressField.match(/time travels\*\*: (\d+)/i);
  const tt = match ? parseInt(match[1]) : null;
  if (!tt) return;

  const playerName = embed.author?.name?.split("—")[0]?.trim();
  const guildId = message.guild?.id;
  if (!playerName || !guildId) return;

  const userId = await tryFindUserIdByName(message.guild, playerName);
  if (!userId) return;

  await cacheTimeTravels(userId, tt);
  console.log(`📦 Cached ${tt} TT for ${playerName} (${userId})`);
}

export async function handleEternalProfileEmbed(message: Message): Promise<void> {
  const guildId = message.guild?.id;
  if (!guildId) return;

  const embed = message.embeds[0];
  const playerName = embed.author?.name?.split("—")[0]?.trim();
  if (!playerName) return;

  const userId = await tryFindUserIdByName(message.guild, playerName);
  if (!userId) return;

  const parsed = parseEternalEmbed(embed);
  if (parsed?._error) return;

  const cachedTT = getCachedTimeTravels(userId);
  const gainedTT = cachedTT && parsed.lastUnsealTT ? cachedTT - parsed.lastUnsealTT : 0;

  console.log("🧾 Saving eternity profile for", userId, {
    currentEternity: parsed.eternalProgress,
    lastUnsealTT: parsed.lastUnsealTT,
    sanitizedLastUnsealTT: parsed.lastUnsealTT > 0 ? parsed.lastUnsealTT : null,
    sword: `T${parsed.swordTier} Lv${parsed.swordLevel}`,
    armor: `T${parsed.armorTier} Lv${parsed.armorLevel}`,
    gainedTT
  });

  await saveOrUpdateEternityProfile(
    userId,
    guildId,
    parsed.eternalProgress,
    null,
    null,
    null,
    parsed.lastUnsealTT,
    playerName,
    parsed.swordTier,
    parsed.swordLevel,
    parsed.armorTier,
    parsed.armorLevel,
    gainedTT > 0 ? gainedTT : null
  );

  await forceProfileSync(userId, guildId);
  console.log(`✅ Eternity Profile updated for ${userId} (${playerName})`);
}

export async function handleEternalDungeonVictory(message: Message): Promise<void> {
  const guildId = message.guild?.id;
  const embed = message.embeds[0];
  const playerName = embed.author?.name?.split("—")[0]?.trim();

  if (!guildId || !playerName) return;

  const userId = await tryFindUserIdByName(message.guild, playerName);
  if (!userId) {
    console.warn(`⚠️ [DUNGEON VICTORY] Could not resolve userId for "${playerName}"`);
    return;
  }
  if (!userId) return;

  const parsed = parseDungeonEmbed(embed);
  if (!parsed?.flamesEarned) {
    console.warn("⚠️ Dungeon embed had no flames.");
    return;
  }

  await addEternalDungeonWin(userId, guildId, parsed.flamesEarned);
  console.log(`🐉 +${parsed.flamesEarned} dungeon flames recorded for ${playerName}`);
  await forceProfileSync(userId, guildId);

}

export async function handleEternalUnsealMessage(message: Message): Promise<void> {
  const guildId = message.guild?.id;
  if (!guildId) return;

  const content = message.content;
  const playerMatch = content.match(/^(\S+)/); // capture the username before 'unsealed'

  if (!playerMatch) {
    console.warn(`⚠️ Could not extract player name from unseal message: "${content}"`);
    return;
  }

  const playerName = playerMatch[1];
  const userId = await tryFindUserIdByName(message.guild, playerName);
  if (!userId) {
    console.warn(`⚠️ [UNSEAL] Could not resolve userId for "${playerName}"`);
    return;
  }

  const flamesMatch = content.match(/-\s*([\d,]+)\s*<:eternityflame/i);
  const bonusTTMatch = content.match(/got\s+([\d,]+)\s*<:timetravel/i);

  const flamesCost = flamesMatch ? parseInt(flamesMatch[1].replace(/,/g, "")) : 0;
  const bonusTT = bonusTTMatch ? parseInt(bonusTTMatch[1].replace(/,/g, "")) : 0;

  if (!flamesCost) {
    console.warn(`⚠️ Could not parse flames cost from message: "${content}"`);
    return;
  }

  console.log(`📤 Recording unseal for ${playerName} (${userId}): -${flamesCost} 🔥, +${bonusTT} TT`);

  await addEternalUnseal(userId, guildId, flamesCost, 0, bonusTT);
  await forceProfileSync(userId, guildId);
}