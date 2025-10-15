import { useState, useEffect } from 'react';
import { Combatant, Attack } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BattleProps {
  player: Combatant;
  enemy: Combatant;
  onVictory: () => void;
  onDefeat: () => void;
}

export const Battle = ({ player: initialPlayer, enemy: initialEnemy, onVictory, onDefeat }: BattleProps) => {
  const [player, setPlayer] = useState(initialPlayer);
  const [enemy, setEnemy] = useState(initialEnemy);
  const [battleLog, setBattleLog] = useState<string[]>(['A wild monster appears!']);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [animatingDamage, setAnimatingDamage] = useState<'player' | 'enemy' | null>(null);

  useEffect(() => {
    if (!isPlayerTurn && enemy.hp > 0) {
      const timer = setTimeout(() => {
        executeEnemyTurn();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, enemy.hp]);

  const executeAttack = (attacker: Combatant, defender: Combatant, attack: Attack, isPlayer: boolean) => {
    const hitRoll = Math.random() * 100;
    const hits = hitRoll < attack.accuracy;

    if (!hits) {
      setBattleLog(prev => [...prev, `${attacker.name}'s ${attack.name} missed!`]);
      return { attacker, defender };
    }

    let damage = attack.damage;
    
    // Apply debuff to enemy attacks
    if (!isPlayer && attacker.debuff) {
      damage = Math.max(0, damage + attacker.debuff);
    }

    let newDefender = { ...defender, hp: Math.max(0, defender.hp - damage) };
    let newAttacker = { ...attacker };

    // Apply effects
    if (attack.effect) {
      if (attack.effect.type === 'debuff') {
        newDefender = {
          ...newDefender,
          debuff: attack.effect.value,
          debuffTurns: attack.effect.duration || 0,
        };
        setBattleLog(prev => [...prev, `${attacker.name} used ${attack.name}! Enemy attack reduced!`]);
      } else if (attack.effect.type === 'heal') {
        newAttacker = {
          ...newAttacker,
          hp: Math.min(newAttacker.maxHp, newAttacker.hp + attack.effect.value),
        };
        setBattleLog(prev => [...prev, `${attacker.name} used ${attack.name}! Healed ${attack.effect.value} HP!`]);
      }
    } else {
      setBattleLog(prev => [...prev, `${attacker.name} used ${attack.name}! Dealt ${damage} damage!`]);
    }

    // Animate damage
    setAnimatingDamage(isPlayer ? 'enemy' : 'player');
    setTimeout(() => setAnimatingDamage(null), 500);

    return { attacker: newAttacker, defender: newDefender };
  };

  const handlePlayerAttack = (attack: Attack) => {
    if (!isPlayerTurn || enemy.hp <= 0) return;

    const result = executeAttack(player, enemy, attack, true);
    setPlayer(result.attacker);
    setEnemy(result.defender);

    if (result.defender.hp <= 0) {
      setTimeout(() => {
        setBattleLog(prev => [...prev, 'Victory! The monster was defeated!']);
        setTimeout(onVictory, 2000);
      }, 1000);
    } else {
      setIsPlayerTurn(false);
    }
  };

  const executeEnemyTurn = () => {
    const randomAttack = enemy.attacks[Math.floor(Math.random() * enemy.attacks.length)];
    
    let currentEnemy = { ...enemy };
    
    // Update debuff duration
    if (currentEnemy.debuff && currentEnemy.debuffTurns !== undefined) {
      if (currentEnemy.debuffTurns > 0) {
        currentEnemy.debuffTurns--;
      } else {
        currentEnemy.debuff = undefined;
        currentEnemy.debuffTurns = undefined;
      }
    }

    const result = executeAttack(currentEnemy, player, randomAttack, false);
    setEnemy(result.attacker);
    setPlayer(result.defender);

    if (result.defender.hp <= 0) {
      setTimeout(() => {
        setBattleLog(prev => [...prev, 'Defeat! You were knocked out!']);
        setTimeout(onDefeat, 2000);
      }, 1000);
    } else {
      setIsPlayerTurn(true);
    }
  };

  const getHpBarColor = (hp: number, maxHp: number) => {
    const percentage = (hp / maxHp) * 100;
    if (percentage > 50) return 'bg-game-hpGood';
    if (percentage > 25) return 'bg-game-hpMedium';
    return 'bg-game-hpLow';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-game-battleBg">
      <div className="w-full max-w-4xl space-y-6">
        {/* Enemy */}
        <Card className={`p-6 bg-card/90 backdrop-blur ${animatingDamage === 'enemy' ? 'battle-shake battle-flash' : ''}`}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-bold text-foreground">{enemy.name}</h2>
            <span className="text-lg text-muted-foreground">{enemy.hp} / {enemy.maxHp} HP</span>
          </div>
          <div className="w-full h-6 bg-secondary rounded-full overflow-hidden border-2 border-border">
            <div
              className={`hp-bar ${getHpBarColor(enemy.hp, enemy.maxHp)}`}
              style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
            />
          </div>
          {enemy.debuff && (
            <p className="text-sm text-destructive mt-2">Attack debuffed! ({enemy.debuffTurns} turns left)</p>
          )}
        </Card>

        {/* Battle Log */}
        <Card className="p-4 bg-card/90 backdrop-blur max-h-32 overflow-y-auto">
          {battleLog.slice(-3).map((log, i) => (
            <p key={i} className="text-sm text-foreground mb-1">{log}</p>
          ))}
        </Card>

        {/* Player */}
        <Card className={`p-6 bg-card/90 backdrop-blur ${animatingDamage === 'player' ? 'battle-shake battle-flash' : ''}`}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-bold text-foreground">{player.name}</h2>
            <span className="text-lg text-muted-foreground">{player.hp} / {player.maxHp} HP</span>
          </div>
          <div className="w-full h-6 bg-secondary rounded-full overflow-hidden border-2 border-border">
            <div
              className={`hp-bar ${getHpBarColor(player.hp, player.maxHp)}`}
              style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
            />
          </div>
        </Card>

        {/* Attack Buttons */}
        <div className="grid grid-cols-2 gap-4">
          {player.attacks.map((attack, i) => (
            <Button
              key={i}
              onClick={() => handlePlayerAttack(attack)}
              disabled={!isPlayerTurn || enemy.hp <= 0 || player.hp <= 0}
              variant="default"
              size="lg"
              className="h-20 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg disabled:opacity-50"
            >
              <div className="flex flex-col items-center">
                <span>{attack.name}</span>
                <span className="text-xs opacity-80">
                  {attack.damage > 0 ? `${attack.damage} DMG` : attack.effect?.type} - {attack.accuracy}%
                </span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
