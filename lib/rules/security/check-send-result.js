const BaseChecker = require('../base-checker')
const TreeTraversing = require('../../common/tree-traversing')

const traversing = new TreeTraversing()

const ruleId = 'check-send-result'
const meta = {
  type: 'security',

  docs: {
    description: `Check result of "send" call.`,
    category: 'Security Rules',
    examples: {
      good: [
        {
          description: 'result of "send" call checked with if statement',
          code: 'if(x.send(55)) {}',
        },
        {
          description: 'result of "send" call checked within a require',
          code: 'require(payable(walletAddress).send(moneyAmount), "Failed to send moneyAmount");',
        },
        {
          description: 'result of "send" assigned to a variable',
          code: 'bool success = payable(walletAddress).send(moneyAmount);',
        },
        {
          description: 'result of "send" passed to a function',
          code: 'doThingWithResult(payable(walletAddress).send(moneyAmount));',
        },
      ],
      bad: [
        {
          description: 'result of "send" call ignored',
          code: 'x.send(55);',
        },
      ],
    },
    notes: [
      {
        note: 'You should use no-unused-var to track that the variable you assign the return value of .send to is actually used',
      },
      {
        note: 'Rule will skip ".send" calls with arity != 1 to avoid false positives on ERC777 sends. you might get a false positive regardless if you define a .send function taking one argument',
      },
    ],
  },

  isDefault: false,
  recommended: true,
  defaultSetup: 'warn',

  schema: null,
}

class CheckSendResultChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta)
  }

  MemberAccess(memberAccess) {
    if (memberAccess.memberName !== 'send') return
    const parentCall = traversing.findParentType(memberAccess, 'FunctionCall')
    // skip 'normal' calls to methods called 'send' which surely
    // are not the one built into 'address'.
    // Ideally we'd ask for the type the expression evaluates to, but without
    // that info in the AST I'll settle for asserting the argument count to
    // not trigger a false positive on erc777. I checked there are no other
    // ERCs defining a .send method, though
    if (parentCall?.arguments?.length !== 1) return

    let node = parentCall.parent
    let previous = parentCall
    while (node?.type !== 'ExpressionStatement') {
      // return value is used in an initalizer, as the condition expression
      // of an if statement, or passed to a function.
      if (['VariableDeclarationStatement', 'IfStatement', 'FunctionCall'].includes(node.type)) {
        return
      }
      // look behind to know if I'm arriving from the right-hand-side of an assignment
      if (node.type === 'BinaryOperation' && node.operator === '=' && node.right === previous) {
        return
      }
      previous = node
      node = node.parent
    }

    this.error(memberAccess, 'Check result of "send" call')
  }
}

module.exports = CheckSendResultChecker
