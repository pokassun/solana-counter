use byteorder::{ByteOrder, LittleEndian};
use solana_program::{account_info::{next_account_info, AccountInfo}, entrypoint, entrypoint::ProgramResult, msg, program_error::ProgramError, pubkey::Pubkey};

// Declare and export the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint's implementation
fn process_instruction(
    program_id: &Pubkey,     // Public key of the program
    accounts: &[AccountInfo], // data accounts
    instruction_data: &[u8],  // 1 = increment, 2 = decrement
) -> ProgramResult {
    msg!("counter program process_instruction");

    let accounts_iter = &mut accounts.iter();

    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("The account must be owned by the program in order to modify its data");
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut data = account.try_borrow_mut_data()?;

    if 1 == instruction_data[0] {
        let mut count = LittleEndian::read_u32(&data[0..4]);
        count += 1;
        LittleEndian::write_u32(&mut data[0..4], count);
        msg!("incremented");
    }

    if 2 == instruction_data[0] {
        let mut count = LittleEndian::read_u32(&data[0..4]);
        // Don't allow count to be negative
        if count.gt(&0) {
            count -= 1;
        }
        LittleEndian::write_u32(&mut data[0..4], count);
        msg!("decremented");
    }

    Ok(())
}

// Sanity tests
#[cfg(test)]
mod test {
    use super::*;
    use std::mem;
    use solana_program::clock::Epoch;

    #[test]
    fn test_sanity() {
        let program_id = Pubkey::default();
        let account_id = Pubkey::default();

        let mut lamports = 0;
        let mut data = vec![0; mem::size_of::<u32>()];
        LittleEndian::write_u32(&mut data[0..4], 0); // set storage to zero

        let owner = Pubkey::default();

        let account = AccountInfo::new(
            &account_id,      // account pubkey
            false,            // is_signer
            true,             // is_writable
            &mut lamports,    // balance in lamports
            &mut data,        // storage
            &owner,           // owner pubkey
            false,            // is_executable
            Epoch::default(), // rent_epoch
        );

        let mut instruction_data: Vec<u8> = vec![0];

        let accounts = vec![account];

        assert_eq!(LittleEndian::read_u32(&accounts[0].data.borrow()[0..4]), 0);

        // Increment

        instruction_data[0] = 1;
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(LittleEndian::read_u32(&accounts[0].data.borrow()[0..4]), 1);

        // Decrement

        instruction_data[0] = 2;
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(LittleEndian::read_u32(&accounts[0].data.borrow()[0..4]), 0);

        // Decrement (test negative number)

        instruction_data[0] = 2;
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(LittleEndian::read_u32(&accounts[0].data.borrow()[0..4]), 0);
    }
}
