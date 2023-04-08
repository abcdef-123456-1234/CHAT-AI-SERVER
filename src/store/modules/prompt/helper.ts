import PromptJson from './prompt.json'
import { ss } from '@/utils/storage'

const LOCAL_NAME = 'promptStore'

export type PromptList = []

export interface PromptStore {
  promptList: PromptList
}

export function getLocalPromptList(): PromptStore {
  // const promptStore: PromptStore | undefined = ss.get(LOCAL_NAME)
  const promptStore: any | undefined = PromptJson
  return promptStore ?? { promptList: [] }
}

export function setLocalPromptList(promptStore: PromptStore): void {
  ss.set(LOCAL_NAME, promptStore)
}
