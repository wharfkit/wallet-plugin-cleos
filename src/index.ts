import {
    ABIDef,
    AbstractWalletPlugin,
    ActionType,
    LoginContext,
    ResolvedSigningRequest,
    Serializer,
    TransactContext,
    TransactHookTypes,
    WalletPlugin,
    WalletPluginConfig,
    WalletPluginLoginResponse,
    WalletPluginMetadata,
    WalletPluginSignResponse,
} from '@wharfkit/session'

export class WalletPluginCleos extends AbstractWalletPlugin implements WalletPlugin {
    /**
     * The logic configuration for the wallet plugin.
     */
    readonly config: WalletPluginConfig = {
        // Should the user interface display a chain selector?
        requiresChainSelect: true,

        // Should the user interface display a permission selector?
        requiresPermissionSelect: false,

        // Should the user interface require input for the permission?
        requiresPermissionEntry: true,
    }
    /**
     * The metadata for the wallet plugin to be displayed in the user interface.
     */
    readonly metadata: WalletPluginMetadata = WalletPluginMetadata.from({
        name: 'cleos',
        description: 'Copy and paste the transactions to sign in cleos.',
        logo: 'data:image/png;base64,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',
        homepage: 'https://github.com/antelopeio/leap',
        download: 'https://github.com/antelopeio/leap',
    })
    /**
     * A unique string identifier for this wallet plugin.
     *
     * It's recommended this is all lower case, no spaces, and only URL-friendly special characters (dashes, underscores, etc)
     */
    get id(): string {
        return 'cleos'
    }
    /**
     * Performs the wallet logic required to login and return the chain and permission level to use.
     *
     * @param options WalletPluginLoginOptions
     * @returns Promise<WalletPluginLoginResponse>
     */
    async login(context: LoginContext): Promise<WalletPluginLoginResponse> {
        if (!context.chain) {
            throw new Error('The cleos wallet plugin requires a chain to be selected.')
        }
        if (!context.permissionLevel) {
            throw new Error('The cleos wallet plugin requires a permissionLevel to be specified.')
        }
        return {
            chain: context.chain.id,
            permissionLevel: context.permissionLevel,
        }
    }
    /**
     * Performs the wallet logic required to sign a transaction and return the signature.
     *
     * @param chain ChainDefinition
     * @param resolved ResolvedSigningRequest
     * @returns Promise<Signature>
     */
    async sign(
        resolved: ResolvedSigningRequest,
        context: TransactContext
    ): Promise<WalletPluginSignResponse> {
        if (!context.ui) {
            throw new Error('The cleos wallet plugin requires a UI to be provided.')
        }
        // During the signing process, add a hook to display the cleos command to the user
        context.addHook(TransactHookTypes.afterSign, async () => {
            // Decode the transaction to be human readable
            const actions: ActionType[] = []
            for (const action of resolved.transaction.actions) {
                const abi: ABIDef = await context.abiCache.getAbi(action.account)
                actions.push({
                    ...action,
                    data: Serializer.objectify(action.decodeData(abi)),
                })
            }
            const decoded = {
                ...resolved.transaction,
                actions,
            }
            // Create the cleos command that will be used to sign the transaction
            const command = `cleos -u ${context.chain.url} push transaction '${JSON.stringify(
                decoded,
                null,
                4
            )}'`
            // Prompt the user with the command to sign the transaction
            await context.ui?.prompt({
                title: 'Sign with cleos',
                body: 'Copy the command to sign the transaction using cleos.',
                elements: [
                    {
                        type: 'textarea',
                        data: {
                            content: command,
                        },
                    },
                    {
                        type: 'button',
                        data: {
                            label: 'Copy to clipboard',
                            onClick: () => {
                                // Ensure the copy to clipboard will work
                                if (!navigator.clipboard || !window.isSecureContext) {
                                    alert(
                                        'Copy to clipboard is not supported in this browser. Please copy the command manually.'
                                    )
                                } else {
                                    navigator.clipboard.writeText(command)
                                }
                            },
                        },
                    },
                ],
            })
        })
        // Return no signatures, as the cleos command will be used to sign the transaction
        return {
            signatures: [],
        }
    }
}
