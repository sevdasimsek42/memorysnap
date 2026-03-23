import { customAlphabet } from "nanoid"

const slugAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789"

export const createSlugCandidate = customAlphabet(slugAlphabet, 12)
