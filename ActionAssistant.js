import {
  deduce,
  sendMessageToUser
} from 'https://chromeautopilot.com/sdk-1.0.0.js'

export const extensionVersion = '0.0.16'
export const name = 'Chrome Autopilot Assistant'
export const assistantId = 'ActionAssistant'
export const description = 'Executes actions for you.'
export const banner = 'chromeautopilot.com'
export const button = 'Chat'
export const isAssistant = true

export default async function ActionAssistant(messages, action) {
  const response = await deduce({
    taskedWithIdentifying: `the inputText param to call the function ${action.name}( inputText )`,
    contextualInformation: `
      The function has the following input prompt:
      
      ${action.inputPrompt}
      
      Please synthesize the user's most recent message to identify the inputText that 
      satisfies the inputPrompt so the function is able to return the desired output for
      the user.

      Refer to previous messages to fill in any gaps.

      If it appears the user is chatting about something irrelevant to the input prompt, 
      then please cordially guide the user back to the input prompt and/or ask for 
      clarification with a chatResponse.
    `,
    JSONOutputExamples: [
      {inputText: 'highlands ranch, cardboard boxes'},
      {inputText: 'the user wants to find scissors at the highlands ranch home depot'},
      {inputText: 'the user is looking for hat channel at the jefferson county location'},
      {inputText: 'r13 insulation, arvada'},
      {chatResponse: "I'm only able to chat about <XYZ>. <paraphrase the inputPrompt>"}
    ],
    messages
  })
  if (response.chatResponse) return sendMessageToUser(response.chatResponse, action.id)
  const { default: runAction } = action
  await runAction(response.inputText)
}