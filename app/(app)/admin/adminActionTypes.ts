export type AdminActionResult =
    | {
          success: true;
      }
    | {
          success: false;
          message: string;
      };

export type AdminAction = (id: string) => Promise<AdminActionResult>;
