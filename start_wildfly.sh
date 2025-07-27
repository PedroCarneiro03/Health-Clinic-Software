#!/bin/bash

# Script para inicializar Docker Compose e instâncias Wildfly
echo "=== Iniciando Docker Compose ==="

# Executa docker compose up na pasta atual
docker compose up -d

echo "Docker Compose iniciado."
echo ""

echo "Aguardando 10 segundos para o Docker Compose estabilizar..."
sleep 10

# Função para abrir terminal e executar comando
open_terminal_and_run() {
    local command="$1"
    local title="$2"
    
    # Para Ubuntu/GNOME Terminal
    if command -v gnome-terminal >/dev/null 2>&1; then
        gnome-terminal --title="$title" --working-directory="$HOME" -- bash -c "$command; exec bash"
    # Para KDE Konsole
    elif command -v konsole >/dev/null 2>&1; then
        konsole --new-tab --title "$title" --workdir "$HOME" -e bash -c "$command; exec bash" &
    # Para xterm (fallback)
    elif command -v xterm >/dev/null 2>&1; then
        xterm -title "$title" -e bash -c "cd $HOME; $command; exec bash" &
    else
        echo "Erro: Nenhum terminal suportado encontrado (gnome-terminal, konsole, xterm)"
        echo "Execute manualmente: $command"
    fi
}

echo "=== Iniciando Wildfly Instance 1 ==="
echo "Abrindo terminal para node1..."

# Abre primeiro terminal para wildfly instance 1
open_terminal_and_run "sudo /opt/wildfly-instance1/bin/standalone.sh -c standalone-ha.xml -Djboss.node.name=node1" "Wildfly Node1"

echo "Aguardando 20 segundos antes de iniciar a segunda instância..."
sleep 20

echo "=== Iniciando Wildfly Instance 2 ==="
echo "Abrindo terminal para node2..."

# Abre segundo terminal para wildfly instance 2
open_terminal_and_run "sudo /opt/wildfly-instance2/bin/standalone.sh -c standalone-ha.xml -Djboss.node.name=node2" "Wildfly Node2"

echo ""
echo "=== Script concluído ==="
echo "- Docker Compose: iniciado"
echo "- Wildfly Node1: terminal aberto"
echo "- Wildfly Node2: terminal aberto (após 20s de delay)"
echo ""
echo "Verifique os terminais abertos para monitorar o status das instâncias Wildfly."