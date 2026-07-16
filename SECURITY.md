# Política de segurança

## Escopo

Este repositório contém uma demonstração sanitizada. Ele não processa clientes
reais, não se conecta ao WhatsApp, não consulta processos e não assina documentos.

## Como reportar

Não publique detalhes exploráveis em uma issue aberta. Use o recurso **Security
Advisories** do GitHub para enviar o relato de forma privada ao mantenedor.

Inclua o cenário, impacto, versão afetada e uma reprodução mínima sem dados
pessoais. O mantenedor fará a triagem e responderá quando possível.

## Regras para integrações privadas

- segredos pertencem ao ambiente do servidor, nunca ao frontend;
- chaves privilegiadas do Supabase jamais podem chegar ao navegador;
- toda tabela exposta deve usar RLS e políticas de autorização por proprietário;
- sessões do WhatsApp, documentos, logs e bancos locais não entram no Git;
- dependências devem permanecer fixadas no `package-lock.json` e auditadas.
