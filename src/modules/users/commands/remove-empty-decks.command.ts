import { CommandRunner, DefaultCommand } from 'nest-commander'

import { DecksRepository } from '../../decks/infrastructure/decks.repository'

@DefaultCommand({
  name: 'remove-empty',
})
export class TaskRunner extends CommandRunner {
  constructor(private decksRepository: DecksRepository) {
    super()
  }

  async run(): Promise<void> {
    console.log('Running remove-empty command')
    const decks = await this.decksRepository.findAllDecksForAdmin({})

    console.log('Found', decks.items.length, 'decks')
    const emptyDecks = decks.items.filter(deck => deck.cardsCount === 0)
    const emptyDeckIds = emptyDecks.map(deck => deck.id)

    console.log('Found', emptyDeckIds.length, 'empty decks')
    if (emptyDeckIds.length === 0) return
    console.log(await this.decksRepository.deleteManyById(emptyDeckIds))

    return
  }
}
