**DeFi France est un Discord autogéré via un système de réputation**, c'est-à-dire que chaque membre **peut gagner ou faire gagner des points de réputation**.

Ces points de **réputations représentent votre implication** dans la communauté, ils sont utilisés par exemple, pour vous assigner **des rôles**, **voter** des propositions, mais également pour la **modération** du Discord, comme déplacer un message hors sujet ou censuré un membre.

Le **gain de réputation** a automatiquement lieu **lorsque vous réagissez à un message**, que ça soit via un **émoji** ou une **réponse**, il est donc important de réagir aux messages qui vous plaisent afin de rétribuer l'auteur.

Vous pouvez configurer la quantité de réputation que l'auteur recevra pour chaque émoji via la commande suivante.  
`/user config reaction:🔥 reaction-grant:2`


Vous pouvez également modifier la quantité de réputation donnée lors d'une réponse avec la commande suivante.  
`/user config reply-grant:10`

Vous pouvez si vous le souhaitez, faire gagner plus de réputation ou changer la quantité que vous avez fait gagner à un membre avec les deux commandes suivantes :  
`/reputation grant-add user:@Charles 53300 amount:10
/reputation grant-set user:@Madmat amount:666`

Quand vous réagissez à un message l'auteur ne gagnera de la réputation qu'à la fin de la période de 14 jours.

Vous pouvez consulter votre réputation, la réputation que vous avez gagné/fait gagnée, ou votre configuration en sélectionnant l'une des options ci-dessous. 





Lorsqu'on arrive à la fin d'une période, **chaque membre va perdre entre 5% et 20% de sa réputation**, au plus il en a, au plus il en perd, cela afin d'**éviter d'avoir de trop grand écart** entre les plus actifs et les autres.

Pour éviter des attaques de bots, la réputation que **vous pouvez offrir** est égale à **5% de votre réputation totale**, le système va automatiquement ramener le total à 5% si vous en avez fait gagner plus.

En plus de ce gain direct de réputation, nous utilisons un **Quadratic Funding**, ce système permet de distribuer une quantité donnée de réputation en **favorisant la diversité** des auteurs au lieu de simplement prendre en compte la quantité de réputation reçue.
**Ainsi une personne ayant gagné 1 point de réputation de 100 personnes, recevra plus qu'une personne ayant reçu 100 points de réputation d'une seule personne**.

La quantité allouée au Quadratic Funding est de 100 points de réputation en plus de la quantité totale qui a été détruite à la fin de la période.

Pour éviter à nouveau les attaques de bots, ce système est **pondéré par l'ancienneté de l'auteur** du gain de réputation, une personne venant d'arriver fera gagner moins qu'un membre actif depuis 3 mois.

Le classement des membres est disponible via la commande suivante (vous pouvez choisir d'afficher les 20 membres à partir du chiffre donné) :  
`/reputation top start:40`



Vous pouvez également **déplacer un message en réagissant** avec, par exemple, cet émoji :hs_bar: , si suffisamment de personnes font de même (200 points de réputation) alors le message sera transféré dans le 🍹-bar

Il est possible de proposer de **censurer une personne** pour X minutes, vous pouvez lancer un vote (2000 points de réputations) via la commande suivante :  
`/proposal mute user:@Charles 53300 duration:5`

Vous souhaitez **sonder l'avis du Discord** ? Lancer un vote via la commande suivante :  
`/proposal start message:https://discord.com/channels/745336259194650788/834365660293365821/924067576743616574 duration:5`  

Si vous récoltez 2000 points de réputation, un vote sera lancé dans 📜-proposition , il faudra ensuite que cette proposition récolte 6000 points de réputations  dans le délai impartît (en jours) pour que le vote soit considéré comme valide.

Pour **récompenser un membre** ayant fourni un effort conséquent, deux choix sont possibles, directement en **mentionnant son exploit** dans le 🏅-panthéon , les gens réagissant avec un émoji à votre message feront gagner des points de réputation aux personnes mentionnées dans ce même message.

Ou vous pouvez directement faire une **proposition pour offrir** une quantité donnée de **réputation** à cette personne :  
`/proposal start message:https://discord.com/channels/745336259194650788/834365660293365821/924067576743616574 duration:5 mint-user:@Charles 53300 mint-qty:500`




Vous pouvez visualiser en 3d le gain de réputation pour chaque round sur https://demeter-visualization.herokuapp.com/, il vous faudra obtenir le lien de la dernière base de donnée en faisant  
`/guild db-url` 



Il existe également un channel 🚮-poubelle afin de cacher les messages indésirables( :hs_poubelle:), vous pouvez réagir à ce message avec l'émoji 👀 pour le voir.



Vous souhaitez être vouché (= parrainé) sur **Proof of Humanity** :poh: ? Utilisez les commandes `/poh` afin de :
* vous ajouter dans la liste des candidats
* consulter la liste : affiche la liste des candidats en train d'être parrainé et ceux en attente
* consulter la liste des candidats déjà vouchés: intéressant pour revoir l'historique
* parrainer un candidat : vous indiquez ainsi que vous vous êtes chargé de voucher un membre. Celui-ci a ensuite 24h pour vous remercier. Durant ces 24h, lorsqu'on affiche la liste, il apparait avec la mention "Being vouched by @Charles 53300 ". Le délai écoulé, sans remerciement, le candidat retourne dans la liste des membres en attente.
* remercier son parrain : permet de vous retirer de la liste et offre des points de réputation à votre parrain
* vous retirer de la liste
