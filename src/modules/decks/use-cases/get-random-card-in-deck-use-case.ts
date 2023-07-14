import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CardsRepository } from '../../cards/infrastructure/cards.repository'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { DecksRepository } from '../infrastructure/decks.repository'
import { Prisma } from '@prisma/client'
import { pick } from 'remeda'

export class GetRandomCardInDeckCommand {
  constructor(public readonly userId: string, public readonly deckId: string) {}
}
type CardWithGrade = Prisma.cardGetPayload<{ include: { grades: true } }>
@CommandHandler(GetRandomCardInDeckCommand)
export class GetRandomCardInDeckHandler implements ICommandHandler<GetRandomCardInDeckCommand> {
  constructor(
    private readonly cardsRepository: CardsRepository,
    private readonly decksRepository: DecksRepository
  ) {}
  private async getSmartRandomCard(cards: Array<CardWithGrade>) {
    const selectionPool: Array<CardWithGrade> = []
    cards.forEach(card => {
      // Calculate the average grade for the card
      const averageGrade =
        card.grades.length === 0
          ? 0
          : card.grades.reduce((acc, grade) => acc + grade.grade, 0) / card.grades.length
      // Calculate weight for the card, higher weight for lower grade card
      const weight = 6 - averageGrade

      // Add the card to the selection pool `weight` times
      for (let i = 0; i < weight; i++) {
        selectionPool.push(card)
      }
    })

    return selectionPool[Math.floor(Math.random() * selectionPool.length)]
  }

  async execute(command: GetRandomCardInDeckCommand) {
    const deck = await this.decksRepository.findDeckById(command.deckId)
    if (!deck) throw new NotFoundException(`Deck with id ${command.deckId} not found`)

    if (deck.userId !== command.userId && deck.isPrivate) {
      throw new ForbiddenException(`You can't get a private deck that you don't own`)
    }

    const cards = await this.cardsRepository.findCardsByDeckIdWithGrade(
      command.userId,
      command.deckId
    )
    const smartRandomCard = await this.getSmartRandomCard(cards)
    return pick(smartRandomCard, ['id', 'question', 'answer', 'deckId'])
  }
}
